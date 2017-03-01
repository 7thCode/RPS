##sudoでパスが通らない場合
    /etc/sudoers

    Defaults    env_reset
    
    を
    
    Defaults    env_keep += "PATH"

    コメントアウト
    #Defaults    secure_path = /sbin:/bin:/usr/sbin:/usr/bin
    
## Build-essential
### Ubuntu
    sudo apt-get update
    sudo apt-get install build-essential
    
## 依存する物
    node.js - プラットフォーム
    mongodb - メインストレージ
    redis - テンポラリ
## Adduser
    adduser hoge
    gpasswd -a hoge sudo
## Node Install
### Ubuntu/Mac    
    まず、nodebrewをインストール
        
    curl -L git.io/nodebrew | perl - setup
    export PATH=$HOME/.nodebrew/current/bin:$PATH
        
    nodeをインストール
        
    nodebrew install-binary v6.X.0
    nodebrew use v6.X.0
## Windows
    see http://qiita.com/takuyakojima/items/780b3b3133a17cceb175
## mongodb Install
### Ubuntu
    apt-get install mongodb
### Mac(Homebrew)
    brew install mongodb
### Windows
    see http://qiita.com/moto_pipedo/items/c3bb40370ba2792143ad
##クエリーロギング
    スタート
    db.setProfilingLevel(1,20)
    ストップ
    db.setProfilingLevel(0)
## Redis Install
### Ubuntu
    sudo apt-get -y install redis-server
### Mac(Homebrew)
    brew install redis
### Windows
    see http://qiita.com/okoi/items/3bb5ae26ad559e4f39a0
## Redis設定
    sudo service redis start
### Ubuntu
    /etc/redis/redis.conf
### Mac(Homebrew)
    /usr/local/etc/redis.conf
    /usr/local/var/log/redis.log
### 設定値
    requirepass zz0101
    maxmemory 500MB
    maxmemory-policy volatile-ttl
## mongodbたまに実行
    $ mongo
    > use admin
    > db.runCommand( { logRotate : 1 } )
    
###localでmongoをcsvで落とす方法（例）
    mongoexport --host=127.0.0.1  --db test2 --collection businesscards --out businesscard.csv  --type=csv --fields=Template,UpdateDate

###上記のmemo
    mongoexport -d login -c accounts -o hoge.csv --csv --fields=_id,Theme.Homepage,Theme.Panflet,local.key,local.category,local.address,local.nickname,local.email,SiteTitle
    
##Mongoアクセス範囲
    
    全てからアクセス可能
    
    > cd /etc
    > sudo nano mongod.conf
   
    で
   
    bindIp: 127.0.0.1
    
    を
 
    bindIp: 0.0.0.0
      
    > sudo service mongod restart  
    
### Ubuntu
    /var/log/mongodb
    rm mongo.log.2016*
### Mac
    /usr/local/var/log/mongodb
    rm mongo.log.2016*
## mongodb 初期化
    $ mongo
    > use chintai2
    > db.createUser({user:"chintai2master", pwd:"33550336", roles:[ "readWrite", "dbOwner" ]})
## Redis Clear
    $ redis-cli
    > AUTH zz0101
    > FLUSHALL
##pm2
#####Install      
    sudo npm install pm2 -g
    sudo pm2 startup ubuntu
#####Use  
    sudo pm2 start start.json --env production
    sudo pm2 save
#####Test  
    sudo reboot
      .
      .
      .
    sudo pm2 list
            
#linuxエトセトラ
##ユーザ
#####USER追加
    adduser USER
#####USERをGROUPに追加      
    gpasswd -a USER GROUP
#####GROUPを追加   
    groupadd GROUP
#####GROUPを確認  
    groups USER
##ディレクトリ
#####中身ごと削除
    rm -R DIRECTORY
##プロセス
#####確認
    ps -elf
##シンボリックリンク(ショートカットっぽいの)    
#####作成
    ln -s
##ドメイン(Nginx)

####最新版インストール

    /etc/apt/sources.list　に追記

    deb http://nginx.org/packages/ubuntu/ trusty nginx
    
    「trusty」てのはでDebian系のバージョン表記なんだって。
    なので、適宜変えてね。
    
    apt-get update
    
    sudo service nginx stop
    
    sudo apt-get remove nginx-common
    
    sudo apt-get install nginx
    
    sudo service nginx start
    
#####ディレクトリ
      cd /etc/nginx
#####存在すべきサイトとして登録
      cd sites-aveilable
      cp default xxx.vvv.jp.conf
#####編集
      sudo nano xxx.vvv.jp.conf

      server {
              listen        80;
              server_name   ドメイン(xxx.netなど);
              #return 301   https://$host$request_uri;
              #access_log   logs/host.access.log  main
      
              location / {
                        proxy_pass アドレス(http://128.199.232.217:20000など)
                        proxy_http_version 1.1;
                        proxy_set_header Upgrade $http_upgrade;
                        proxy_set_header Connection "upgrade";
                        proxy_redirect http:// https://;
                        }
              }
              
      Let's EncryptでHTTPSならば        
              
      server {
              listen 443 ssl;
              
              (nginxが1.9.6以上ならば)
              
              listen 443 ssl http2;
              
              server_name ドメイン(xxx.netなど);
              ssl_certificate      /etc/letsencrypt/live/[ファイル名確認]/fullchain.pe$
              ssl_certificate_key  /etc/letsencrypt/live/[ファイル名確認]/privkey.pem;
      
              #access_log  logs/host.access.log  main;
      
              location / {
                  proxy_pass http://localhost:30000;
                  proxy_http_version 1.1;
                  proxy_set_header Upgrade $http_upgrade;
                  proxy_set_header Connection "upgrade";
              }
      }        
      
      cd ../sites-enabled
      ln -s ../sites-aveilable/xxxxx . 


####開始/終了/再起動

    終了
    sudo service nginx stop

    開始
    sudo service nginx start

    再起動
    sudo service nginx configtest

##Backup

####full backup
    
    > sudo service mongodb stop
    > sudo mongodump --dbpath /var/lib/mongo

####full restore
    
    > sudo service mongodb stop
    > sudo mongorestore --dbpath /var/lib/mongo dump


####buckup

    > cd ...
    > mongodump
    
####restore

    > mongorestore --host localhost --db test_db ./dump/test_db

####Zip

    zip -r dump.zip dump
    
####SCP
    
     scp dump.zip XXX.XXX.XXX.XXX:/path/to/dist

####sudo
    
    pathを引き継ぐ。(digital ocean, etc..)
    
    Defaults    env_reset
    #Defaults   secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
    Defaults    env_keep += "PATH"
     
####mail

    sudo saslpasswd2 -u seventh-code.com -c oda
        
##Mecab ユーザ辞書

     mac(homebrew)

     /usr/local/Cellar/mecab/0.996/libexec/mecab/mecab-dict-index  -d /usr/local/lib/mecab/dic/ipadic -u /usr/local/lib/mecab/dic/userdic/music.dic -f utf-8 -t utf-8 mecab_music_dic.csv

     /usr/local/etc/mecabrc

     ubuntu(apt-get)

     /usr/lib/mecab/mecab-dict-index                               -d /usr/share/mecab/dic/ipadic     -u /var/lib/mecab/dic/music.dic               -f utf-8 -t utf-8 mecab_music_dic.csv

     sudo nano /etc/mecabrc

####GMail

    セキュリティ
    
    https://myaccount.google.com/u/1/security
    
    安全性の低いアプリの許可: 有効　とする
    
    
    

####Let's Encrypt（HTTPSの認証)

    ここ見ろ
    
    https://letsencrypt.jp/usage/
        
    まず、certbot-autoってのをインストール
    
    > cd ~
    > mkdir certbot
    > cd certbot
    > wget https://dl.eff.org/certbot-auto
    > chmod a+x certbot-auto
    > ./certbot-auto
    
    実行
    
    > cd ~
    > cd ceartbot
    > ./certbot-auto certonly --no-self-upgrade -n --standalone  --agree-tos --email oda.mikio@gmail.com -d www.aaa.com

    -nginxってのが使える？使うと楽？
    
    
    更新
    
    > cd ~
    > cd ceartbot
    > ./certbot-auto renew -q --no-self-upgrade
    
    
    
    証明書の取得時に使用したオプションは
    
    /etc/letsencrypt/renewal/${DOMAIN}.conf
   
   
##openssl
   
    作るもの
   
    秘密鍵
    公開鍵
    証明書
   
####秘密鍵
   
    openssl genrsa -aes128 1024 > server.key
   
####公開鍵
 
    openssl req -new -key server.key > server.csr   

####証明書

    openssl x509 -in server.csr -days 365 -req -signkey server.key > server.crt
   
   
   
   
   
# 独り言

## Angular2 + Node.js

###angular-cliでなんかつくる
    そこのディレクトリで
        npm install express --save
        npm install cookie-parser body-parser morgan --save
        
###srcディレクトリにapp.jsつくる。
    
        var express = require('express');
        var path = require('path');
        var favicon = require('serve-favicon');
        var logger = require('morgan');
        var cookieParser = require('cookie-parser');
        var bodyParser = require('body-parser');
        
        var app = express();
        
        // uncomment after placing your favicon in /public
        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(cookieParser());
        app.use(express.static(__dirname));
        
        app.get('/*', function (req, res) {
          res.sendFile(path.join(__dirname,'index.html'));
        });
        
        // catch 404 and forward to error handler
        app.use(function(req, res, next) {
          var err = new Error('Not Found');
          err.status = 404;
          next(err);
        });
        
        
        if (app.get('env') == "development")
        {
          app.listen(3000, function () {
            console.log('Example listening on port 3000!');
          });
        }
        else{
          app.listen(8080, function () {
            console.log('Example listening on port 8080!');
          });
        }
        
        module.exports = app;

    
###iOSのBase64 Tips
                     
      NSData通るとなぜか"+"が" "になってるんです。
      逆変換するべし。。。？？？
      なんかあるんやろな。。
      こんなかんじ。  
      
      let data1 = data0.replace( / /g , "+" );
     
##心がけよう

    シンプルに。
    迷う時はシンプルな方に。
    ソフトウェアの最大の敵は複雑性。ソフトウェア工学は複雑性と戦うための武器。複雑性を閉じ込めろ。
    複雑性とは関連する物とその関連性の数。
    まずは名前が大事。
    各種のモジュールやら変数やらの名前が決まったら、半分くらいはできたようなもん。
    ソースのサイズは複雑さに非らず。長くてもシンプルに。
    変数名は可能な限りフルスペル。スペルの省略には個性が入り混じってしまう。コピペ多用すべし。
    コピペも満足にできないようなのは"エディタ"じゃない。それはなんか苦行強いる宗教の類。。。
    「俺のソースは短いよ！かっこいいだろ！」は、ホビイスト。
    ソースが表現の全て。可能な限りソースで処理を表現すべし。
    可能な限り処理自体にヒントを埋め込め。それを冗長とは言わない。
    コメントよりヒント。ソースで表現できない部分のみ文章で補う。
    言語固有の変な書き方はやめよう。まずは言語間の移植性、次に言語設計者の意図、次にシンプルさ。
    コピペ最強。なんせキーボード打つより間違わない。可能な部分は可能な限りコピペは義務。
    フルスペルの長い名前をコピペ。　うぃdth＝
    起動時、初期化時に可能な限りの処理を“試用”すべし。立ち上がればほぼ動作する感じで。
    何かが少しでもおかしい場合は大騒ぎするように。異常を隠すのは無意識でも罪。
    「遅い、早い、大きい、小さい」は相対評価。「効率がいい、悪い」が絶対評価。
    最適なアルゴリズムを採用すれば、シンプルになる。複雑だと感じたら基本から考え直そう。
    ソフトウェアの「技術力」とは複雑性をいかに克服できるかの度合い。複雑さの「達成」度合いではない。
    知識はエントロピー、広がれば無意味。
  
    
#### "a || b"パターンの使用は控えよう。

    完全にJavaScriptに閉じたイディオムの上、あんま意味もないので、教育上よくない。。。
    平たく書けば

        let result = HOGE || PIYO;

    は

        let result = HOGE;
        if (!HOGE) {
            result = PIYO;
        }

    なんら条件分岐が減るわけでもなく、単純にタイピング量wが減るだけ。。
    "a"がfalsyなら"b"って...
    たくさーん連結すればなんかいいこともあるかな？
    最後のtrueまで評価なんだろうな。。知らんけど。
    なんかなあ。。。
    
    ソースのサイズは複雑さに非らず。
    キーボード打つのがそんな嫌いなら、この商売向いてないよ？
    
#### "!!"パターンの使用もあかん。

    これも完全に形無し言語に閉じたイディオムの上、あんま意味もないので、教育上よくない。。。
    ちゃんと"Boolean()"しよう。それだけ。
    

####パターン・イディオムは無理やり使わない

    適応できない部分はあっさり諦めよう。
    パターンを変化させればもはやそれはパターンではない。


####TypeScriptの"this"は罠あり

    Mongooseで

    HogeSchema.static("hogeFunc", ():void => {

      this.....

    });

  と

    HogeSchema.static("hogeFunc", function():void {

      this.....

    });


    だと、下はthisが暗黙で_thisになるため、うまくない。
    thisあれば素直にfunctionかな。
    つくづくかっこ悪い言語。


####いつか使う

  ECMAScript パーサー
    
        http://esprima.org/
        
  ジェネレータ
        
        https://github.com/estools/escodegen
        
  Parser API
        
        https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Expressions