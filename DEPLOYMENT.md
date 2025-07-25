# VPS運用ガイド

## 概要
このドキュメントでは、塩釜時刻表バックエンドAPIをVPSで運用する方法について説明します。

## 前提条件
- VPSサーバーが利用可能
- SSH接続が可能
- rootまたはsudo権限がある

## 方法1: Docker Compose（推奨）

### 1. 必要なソフトウェアのインストール

#### Dockerのインストール
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Composeのインストール
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. プロジェクトのデプロイ
```bash
# プロジェクトをクローン
git clone <your-repository-url>
cd shiogama-timetable-back

# データベースファイルの準備（初回のみ）
touch timetable.db

# Docker Composeで起動
docker-compose up -d

# ログの確認
docker-compose logs -f
```

### 3. サービスの管理
```bash
# サービス停止
docker-compose down

# サービス再起動
docker-compose restart

# サービス更新（新しいコードをpull後）
git pull
docker-compose up -d --build
```

## 方法2: 直接実行

### 1. Bunのインストール
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

### 2. プロジェクトのセットアップ
```bash
# プロジェクトをクローン
git clone <your-repository-url>
cd shiogama-timetable-back

# 依存関係のインストール
bun install

# データベースのセットアップ
bun run db:generate
bun run db:push
bun run db:seed
```

### 3. プロセス管理（PM2使用）

#### PM2のインストール
```bash
npm install -g pm2
```

#### アプリケーションの起動
```bash
# PM2でアプリケーションを起動
pm2 start "bun run start" --name shiogama-api

# システム起動時に自動開始
pm2 startup
pm2 save
```

#### PM2コマンド
```bash
# ステータス確認
pm2 status

# ログ確認
pm2 logs shiogama-api

# 再起動
pm2 restart shiogama-api

# 停止
pm2 stop shiogama-api

# 削除
pm2 delete shiogama-api
```

## ネットワーク設定

### ファイアウォール設定
```bash
# UFW（Ubuntu Firewall）の場合
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # API（直接アクセスする場合）
sudo ufw enable
```

### Nginx設定（リバースプロキシ）

#### Nginxのインストール
```bash
sudo apt update
sudo apt install nginx
```

#### 設定ファイル
```bash
sudo nano /etc/nginx/sites-available/shiogama-api
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 設定の有効化
```bash
sudo ln -s /etc/nginx/sites-available/shiogama-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL証明書の設定（Certbot）

### Certbotのインストール
```bash
sudo apt install certbot python3-certbot-nginx
```

### SSL証明書の取得
```bash
sudo certbot --nginx -d your-domain.com
```

### 自動更新の設定
```bash
sudo crontab -e
# 以下を追加
0 12 * * * /usr/bin/certbot renew --quiet
```

## 監視とメンテナンス

### ログの確認
```bash
# Docker Composeの場合
docker-compose logs -f

# PM2の場合
pm2 logs shiogama-api

# Nginxログ
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### データベースのバックアップ
```bash
# SQLiteファイルのバックアップ
cp timetable.db timetable.db.backup.$(date +%Y%m%d_%H%M%S)

# 定期バックアップのcron設定
crontab -e
# 毎日午前2時にバックアップ
0 2 * * * cp /path/to/shiogama-timetable-back/timetable.db /path/to/backup/timetable.db.$(date +\%Y\%m\%d)
```

### システムリソースの監視
```bash
# システムリソース確認
htop
df -h
free -h

# Docker使用量確認
docker system df
```

## アップデート手順

### 1. コードの更新
```bash
cd shiogama-timetable-back
git pull origin main
```

### 2. Docker Composeの場合
```bash
docker-compose down
docker-compose up -d --build
```

### 3. 直接実行の場合
```bash
bun install  # 依存関係に変更がある場合
bun run db:generate  # スキーマに変更がある場合
pm2 restart shiogama-api
```

## トラブルシューティング

### よくある問題

#### ポート3000が使用中
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

#### データベース権限エラー
```bash
chmod 664 timetable.db
chown user:user timetable.db
```

#### メモリ不足
```bash
# スワップファイルの作成
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## セキュリティ考慮事項

- SSH鍵認証の使用
- 不要なポートの閉鎖
- 定期的なシステムアップデート
- データベースファイルの適切な権限設定
- SSL証明書の使用
- APIレート制限の実装（必要に応じて）

## 連絡先・サポート

問題が発生した場合は、プロジェクトのIssuesページで報告してください。