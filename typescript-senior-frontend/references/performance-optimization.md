# 前端性能优化指南

## 1. 渲染优化

### 1.1 React渲染优化

#### 组件记忆化
```typescript
// 使用React.memo优化组件渲染
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});

// 使用useMemo缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// 使用useCallback缓存函数引用
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

#### 避免不必要的渲染
- **避免在render中创建新对象**：
  ```typescript
  // 错误做法
  <Component style={{ color: 'red' }} />
  
  // 正确做法
  const style = useMemo(() => ({ color: 'red' }), []);
  <Component style={style} />
  ```

- **使用key属性优化列表渲染**：
  ```typescript
  // 错误做法
  {items.map((item) => <Item key={item.index} data={item} />)}
  
  // 正确做法
  {items.map((item) => <Item key={item.id} data={item} />)}
  ```

#### 批量更新状态
```typescript
// React 18自动批量更新
const handleClick = () => {
  setCount(count + 1);
  setTitle('New Title');
  setActive(true);
  // 只触发一次重新渲染
};

// 在异步回调中使用flushSync强制批量更新
import { flushSync } from 'react-dom';

const handleClick = async () => {
  await fetchData();
  
  flushSync(() => {
    setCount(count + 1);
    setTitle('New Title');
  });
  // 只触发一次重新渲染
};
```

### 1.2 Vue渲染优化

#### 计算属性缓存
```typescript
// 使用计算属性缓存计算结果
const expensiveValue = computed(() => {
  return computeExpensiveValue(a.value, b.value);
});
```

#### v-once指令
```vue
<!-- 只渲染一次，后续不再更新 -->
<div v-once>{staticContent}</div>
```

#### v-memo指令（Vue 3.2+）
```vue
<!-- 只有当deps数组中的值变化时才重新渲染 -->
<div v-memo="[dep1, dep2]">
  {{ expensiveRendering }}
</div>
```

### 1.3 通用渲染优化

#### 虚拟列表
- **react-window**：适用于React
- **vue-virtual-scroll-grid**：适用于Vue
- **@tanstack/vue-virtual**：同时支持React和Vue

```typescript
// react-window示例
import { FixedSizeList as List } from 'react-window';

const Row = ({ index, style }) => (
  <div style={style}>
    Row {index}
  </div>
);

const VirtualList = ({ items }) => (
  <List
    height={600}
    itemCount={items.length}
    itemSize={35}
    width="100%"
  >
    {Row}
  </List>
);
```

#### 懒加载组件
```typescript
// React
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Vue
const LazyComponent = () => import('./LazyComponent.vue');
```

## 2. 网络优化

### 2.1 HTTP优化

#### HTTP/2和HTTP/3
- **HTTP/2**：多路复用、服务器推送、头压缩
- **HTTP/3**：基于QUIC协议，减少连接建立时间
- **实现方式**：配置服务器支持HTTP/2和HTTP/3

#### 缓存策略
- **强缓存**：
  ```
  Cache-Control: max-age=31536000, immutable
  Expires: Thu, 31 Dec 2025 23:59:59 GMT
  ```

- **协商缓存**：
  ```
  ETag: "1234567890"
  Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT
  ```

- **缓存位置**：Service Worker Cache > Memory Cache > Disk Cache

#### CDN加速
- **静态资源**：图片、CSS、JavaScript、字体
- **区域节点**：就近访问，减少延迟
- **缓存策略**：配合HTTP缓存头

### 2.2 API优化

#### API设计
- **GraphQL**：按需获取数据，减少网络请求
- **RESTful API**：合理设计资源路径和HTTP方法
- **分页**：避免返回大量数据
- **过滤和排序**：在服务器端进行

#### 请求优化
- **合并请求**：GraphQL、批量API
- **防抖和节流**：
  ```typescript
  // 防抖
  const debouncedSearch = debounce((query) => {
    searchAPI(query);
  }, 300);
  
  // 节流
  const throttledScroll = throttle(() => {
    loadMoreData();
  }, 1000);
  ```

- **预取**：
  ```typescript
  // 基于用户行为预取
  const handleHover = (item) => {
    if (!isPrefetched[item.id]) {
      prefetchAPI(item.id);
      isPrefetched[item.id] = true;
    }
  };
  ```

## 3. 资源优化

### 3.1 图片优化

#### 图片格式
- **WebP**：现代浏览器支持，压缩率高
- **AVIF**：更高压缩率，但支持度较低
- **JPEG**：适合照片
- **PNG**：适合透明图片
- **SVG**：适合图标和矢量图形

#### 响应式图片
```html
<!-- srcset属性 -->
<img 
  src="image-400w.jpg" 
  srcset="image-400w.jpg 400w, image-800w.jpg 800w, image-1200w.jpg 1200w" 
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="描述文字"
>

<!-- picture元素 -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="描述文字">
</picture>
```

#### 图片懒加载
```html
<!-- 原生懒加载 -->
<img src="image.jpg" loading="lazy" alt="描述文字">

<!-- 带占位符的懒加载 -->
<img 
  src="placeholder.jpg" 
  data-src="image.jpg" 
  class="lazyload" 
  alt="描述文字"
>
```

### 3.2 CSS优化

#### CSS压缩和合并
- **PostCSS**：压缩CSS
- **PurgeCSS**：移除未使用的CSS
- **CSS Modules**：局部作用域CSS

#### 避免CSS阻塞渲染
```html
<!-- 关键CSS内联 -->
<style>
  /* 关键CSS */
  body { margin: 0; padding: 0; }
  .header { display: flex; }
</style>

<!-- 非关键CSS异步加载 -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>
```

#### CSS变量
```css
:root {
  --primary-color: #6366F1;
  --font-size-base: 16px;
}

.button {
  color: var(--primary-color);
  font-size: var(--font-size-base);
}
```

### 3.3 JavaScript优化

#### 代码分割
```typescript
// 动态import
const LazyComponent = await import('./LazyComponent');

// React懒加载
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Vue路由懒加载
const routes = [
  {
    path: '/lazy',
    component: () => import('./LazyView.vue')
  }
];
```

#### Tree Shaking
```typescript
// 只导入需要的函数
import { debounce } from 'lodash-es';

// 避免导入整个库
// import _ from 'lodash';
```

#### 最小化包体积
- **使用现代构建工具**：Vite、Webpack 5
- **分析包体积**：webpack-bundle-analyzer、vite-bundle-analyzer
- **替换大型库**：
  - day.js 替代 moment.js
  - lodash-es 替代 lodash
  - swr 或 react-query 替代 redux

### 3.4 字体优化

#### 字体格式
- **WOFF2**：现代浏览器首选
- **WOFF**：兼容性更好
- **TTF/OTF**：传统格式

#### 字体加载策略
```html
<!-- 预加载字体 -->
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>

<!-- 字体显示策略 -->
<style>
  @font-face {
    font-family: 'CustomFont';
    src: url('font.woff2') format('woff2');
    font-display: swap; /* 可选：swap, fallback, optional, block */
  }
</style>
```

## 4. 打包优化

### 4.1 Webpack优化

#### 缓存
```javascript
// webpack.config.js
module.exports = {
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  }
};
```

#### 多进程构建
```javascript
// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true
      }),
      new CssMinimizerPlugin({
        parallel: true
      })
    ]
  }
};
```

### 4.2 Vite优化

#### 依赖预构建
```javascript
// vite.config.js
export default defineConfig({
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
```

#### 构建优化
```javascript
// vite.config.js
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['antd', '@mui/material']
        }
      }
    }
  }
});
```

## 5. 运行时优化

### 5.1 内存管理

#### 避免内存泄漏
- 清理事件监听器
- 清理定时器
- 清理DOM引用
- 使用WeakMap和WeakSet

```typescript
// 使用useEffect清理资源
useEffect(() => {
  const handleResize = () => {
    // 处理窗口大小变化
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

#### 大对象优化
- 使用Object.create(null)创建没有原型的对象
- 避免创建过大的对象
- 及时释放不再使用的对象

### 5.2 动画优化

#### CSS动画
```css
/* 只使用transform和opacity属性 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animated-element {
  animation: fadeIn 0.3s ease-out;
  will-change: opacity, transform;
}
```

#### 动画帧
```typescript
// 使用requestAnimationFrame
let animationId;

const animate = () => {
  // 动画逻辑
  animationId = requestAnimationFrame(animate);
};

// 开始动画
animate();

// 结束动画
cancelAnimationFrame(animationId);
```

## 6. 性能监控和分析

### 6.1 Core Web Vitals

#### Largest Contentful Paint (LCP)
- **目标**：< 2.5秒
- **监控工具**：Lighthouse、Web Vitals Chrome扩展
- **优化策略**：
  - 优化服务器响应时间
  - 预连接到关键来源
  - 优化关键渲染路径
  - 优化资源加载

#### First Input Delay (FID)
- **目标**：< 100毫秒
- **监控工具**：Lighthouse、Web Vitals Chrome扩展
- **优化策略**：
  - 减少JavaScript执行时间
  - 代码分割
  - 减少主线程阻塞
  - 使用Web Workers

#### Cumulative Layout Shift (CLS)
- **目标**：< 0.1
- **监控工具**：Lighthouse、Web Vitals Chrome扩展
- **优化策略**：
  - 为图片设置固定尺寸
  - 避免动态注入内容
  - 使用transform代替top/left
  - 为广告和嵌入内容预留空间

### 6.2 监控工具

#### 浏览器开发者工具
- **Performance**：记录和分析页面性能
- **Network**：分析网络请求
- **Memory**：分析内存使用情况
- **Lighthouse**：生成性能报告

#### 性能监控服务
- **Sentry**：错误监控和性能跟踪
- **New Relic**：应用性能监控
- **Datadog**：全栈监控
- **Google Analytics 4**：用户体验监控

#### 自定义监控
```typescript
// 使用Performance API
const measurePerformance = () => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(entry);
    }
  });
  
  observer.observe({ entryTypes: ['paint', 'layout-shift', 'first-input'] });
};

// 监控LCP
const monitorLCP = () => {
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const largestEntry = entries[entries.length - 1];
    console.log('LCP:', largestEntry.renderTime || largestEntry.loadTime);
  }).observe({ entryTypes: ['largest-contentful-paint'] });
};
```

## 7. 性能优化最佳实践

### 7.1 构建优化流程
1. **测量**：使用Lighthouse、Web Vitals等工具测量性能
2. **分析**：识别性能瓶颈
3. **优化**：实施针对性的优化策略
4. **验证**：再次测量，验证优化效果
5. **监控**：在生产环境持续监控性能

### 7.2 性能预算
- **定义**：为性能指标设定目标
- **工具**：webpack-performance-budget、lighthouse-budget
- **示例**：
  ```json
  {
    "budget": {
      "resourceSizes": [
        { "resourceType": "script", "budget": 500 },
        { "resourceType": "image", "budget": 1000 }
      ],
      "timings": [
        { "metric": "first-contentful-paint", "budget": 2000 },
        { "metric": "largest-contentful-paint", "budget": 3000 }
      ]
    }
  }
  ```

### 7.3 渐进式增强
- **核心功能优先**：确保核心功能在所有设备上都能正常工作
- **优雅降级**：在不支持某些特性的浏览器上提供替代方案
- **条件加载**：根据设备能力加载相应的资源

### 7.4 持续优化
- **定期性能审计**：每季度或半年进行一次
- **性能监控**：实时监控生产环境性能
- **性能文化**：将性能纳入开发流程和考核指标

## 8. 案例分析

### 案例：大型电商网站性能优化

**背景**：
- 页面加载时间长（首屏加载时间 > 5秒）
- 交互响应慢
- 移动端体验差

**优化措施**：
1. **服务器优化**：
   - 启用HTTP/2
   - 优化服务器响应时间
   - 实施CDN加速

2. **资源优化**：
   - 图片WebP格式转换
   - 响应式图片实现
   - 图片懒加载

3. **代码优化**：
   - 代码分割
   - Tree Shaking
   - 关键CSS内联
   - 非关键CSS异步加载

4. **渲染优化**：
   - 服务端渲染(SSR)
   - 静态站点生成(SSG)
   - 增量静态再生(ISR)
   - 虚拟列表实现

**成果**：
- 首屏加载时间：5秒 → 1.5秒
- 交互响应时间：> 100ms → < 50ms
- 移动端转化率提升：25%
- Core Web Vitals达标率：50% → 95%

## 9. 总结

前端性能优化是一个持续的过程，需要从多个维度进行考虑：

1. **渲染优化**：减少不必要的渲染，优化组件渲染
2. **网络优化**：优化HTTP请求，减少网络延迟
3. **资源优化**：优化图片、CSS、JavaScript等资源
4. **打包优化**：减少包体积，优化构建流程
5. **运行时优化**：优化内存使用，提升运行时性能
6. **性能监控**：持续监控性能，及时发现问题

通过实施这些优化策略，可以显著提升前端应用的性能，改善用户体验，提高转化率和用户满意度。性能优化没有终点，需要持续关注和改进，以适应不断变化的技术和用户需求。