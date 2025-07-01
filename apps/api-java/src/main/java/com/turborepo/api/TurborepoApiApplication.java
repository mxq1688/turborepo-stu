package com.turborepo.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories
public class TurborepoApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(TurborepoApiApplication.class, args);
    }

} 