FROM php:8.2-apache

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    && rm -rf /var/lib/apt/lists/*

# 安装PHP扩展
RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip \
    && pecl install redis \
    && docker-php-ext-enable redis

# 启用Apache模块
RUN a2enmod rewrite headers

# 安装Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 设置工作目录
WORKDIR /var/www/html

# 复制应用代码
COPY . .

# 设置Apache配置
COPY apache-config.conf /etc/apache2/sites-available/000-default.conf

# 安装PHP依赖
RUN composer install --no-dev --optimize-autoloader

# 设置权限
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# 暴露端口
EXPOSE 80

# 启动Apache
CMD ["apache2-foreground"] 