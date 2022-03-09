import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
 
@Configuration
public class CorsFilter implements WebMvcConfigurer {
 
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")    // 设置允许跨域的路径
                .allowedOrigins("*")    //允许跨域的域名，可以用*表示允许任何域名使用
                .allowCredentials(true)  // 是否允许证书
                .allowedMethods("*")    //允许任何方法（post、get等）
                .maxAge(3600); //缓存持续的最大时间
    }
}