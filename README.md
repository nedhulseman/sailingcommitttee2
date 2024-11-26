## Instructions
1. Instance: i-05f65df1033f78875
2. sudo su
3. cd ~/sailingcommittee


## Nginx
`cd /etc/nginx/sites-available`
```
server {
    server_name www.racingcommittee.com racingcommittee.com ;

    location / {
        proxy_pass http://172.31.45.252:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl; # managed by Certbot
    
    
    ssl_certificate /etc/letsencrypt/live/racingcommittee.com/fullchain.pem; # >
    ssl_certificate_key /etc/letsencrypt/live/racingcommittee.com/privkey.pem; >
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot


}
server {
    if ($host = www.racingcommittee.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = racingcommittee.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name www.racingcommittee.com racingcommittee.com ;
    return 404; # managed by Certbot

}
## DB
`mysql -u root -p`
`CREATE DATABASE databasename;`
```CREATE TABLE users (
    id INT(11) AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(255),
primary key (id)
);```
```CREATE TABLE race_location (
    id INT(11) AUTO_INCREMENT,
    primary key (id),
    race_id INT(11),
    boat_id INT(11),
    email VARCHAR(100),
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lat DECIMAL(10, 8),
    lon DECIMAL(11, 8)
);```

## Resources
- Deploying Node: https://www.sammeechward.com/deploying-full-stack-js-to-aws-ec2
- Mysql: https://medium.com/@rohan_precise/step-by-step-guide-setting-up-and-connecting-mysql-on-ec2-ubuntu-instance-72>
- Login forms: https://blog.logrocket.com/building-simple-login-form-node-js/
