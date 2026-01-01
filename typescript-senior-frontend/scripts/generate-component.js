#!/usr/bin/env node

/**
 * TypeScript React组件生成脚本
 * 用于快速生成符合最佳实践的Web端React组件
 * 使用方法：node generate-component.js ComponentName
 */

const fs = require('fs');
const path = require('path');

// 检查参数
if (process.argv.length < 3) {
  console.error('请提供组件名称');
  console.log('使用方法：node generate-component.js ComponentName');
  process.exit(1);
}

const componentName = process.argv[2];
const componentPath = path.join(process.cwd(), `${componentName}.tsx`);
const testPath = path.join(process.cwd(), `${componentName}.test.tsx`);
const storyPath = path.join(process.cwd(), `${componentName}.stories.tsx`);

// 检查组件是否已存在
if (fs.existsSync(componentPath)) {
  console.error(`组件 ${componentName} 已存在`);
  process.exit(1);
}

// 生成组件模板
const componentTemplate = 'import React from \'react\';\n\n/**\n * ' + componentName + '组件Props\n */\nexport interface ' + componentName + 'Props {\n  /** 组件内容 */\n  children: React.ReactNode;\n  /** 自定义样式 */\n  className?: string;\n  /** 是否禁用 */\n  disabled?: boolean;\n  /** 自定义主题颜色 */\n  color?: string;\n  /** 点击事件 */\n  onClick?: () => void;\n  /** 其他HTML按钮属性 */\n  [key: string]: any;\n}\n\n/**\n * ' + componentName + '组件\n * 用于展示' + componentName + '功能\n */\nconst ' + componentName + ': React.FC<' + componentName + 'Props> = ( {\n  children,\n  className = \'\',\n  disabled = false,\n  color = \'#6366F1\',\n  onClick,\n  ...rest\n} ) => {\n  return (\n    <button\n      className={`' + componentName.toLowerCase() + ' ${disabled ? \'disabled\' : \'\'} ${className}`}\n      style={{\n        backgroundColor: disabled ? \'#E5E7EB\' : color,\n        padding: \'12px 16px\',\n        borderRadius: \'8px\',\n        border: \'none\',\n        color: \'#FFFFFF\',\n        fontSize: \'16px\',\n        fontWeight: \'600\',\n        cursor: disabled ? \'not-allowed\' : \'pointer\',\n        opacity: disabled ? 0.6 : 1,\n        transition: \'all 0.2s ease\',\n        boxShadow: \'0 2px 4px rgba(0, 0, 0, 0.1)\',\n      }}\n      disabled={disabled}\n      onClick={onClick}\n      {...rest}\n    >\n      {children}\n    </button>\n  );\n};\n\nexport default ' + componentName + ';';

// 生成测试模板
const testTemplate = 'import React from \'react\';\nimport { render, screen, fireEvent } from \'@testing-library/react\';\nimport ' + componentName + ' from \'./' + componentName + '\';\n\ndescribe(\'' + componentName + '组件测试\', () => {\n  test(\'应该正确渲染组件内容\', () => {\n    const testText = \'测试' + componentName + '\';\n    render(<' + componentName + '>{testText}</' + componentName + '>);\n    \n    const componentText = screen.getByText(testText);\n    expect(componentText).toBeTruthy();\n  });\n  \n  test(\'应该应用自定义样式\', () => {\n    const customColor = \'#FF0000\';\n    render(\n      <' + componentName + ' color={customColor}>\n        自定义样式\n      </' + componentName + '>\n    );\n    \n    const component = screen.getByText(\'自定义样式\');\n    expect(component).toHaveStyle({ backgroundColor: customColor });\n  });\n  \n  test(\'应该响应点击事件\', () => {\n    const onClick = jest.fn();\n    render(\n      <' + componentName + ' onClick={onClick}>\n        点击测试\n      </' + componentName + '>\n    );\n    \n    const component = screen.getByText(\'点击测试\');\n    fireEvent.click(component);\n    \n    expect(onClick).toHaveBeenCalledTimes(1);\n  });\n  \n  test(\'禁用状态应该正确工作\', () => {\n    const onClick = jest.fn();\n    render(\n      <' + componentName + ' disabled onClick={onClick}>\n        禁用测试\n      </' + componentName + '>\n    );\n    \n    const component = screen.getByText(\'禁用测试\');\n    fireEvent.click(component);\n    \n    expect(onClick).not.toHaveBeenCalled();\n    expect(component).toHaveAttribute(\'disabled\');\n    expect(component).toHaveStyle({ opacity: 0.6 });\n  });\n  \n  test(\'应该支持自定义className\', () => {\n    const customClass = \'custom-class\';\n    render(\n      <' + componentName + ' className={customClass}>\n        自定义className\n      </' + componentName + '>\n    );\n    \n    const component = screen.getByText(\'自定义className\');\n    expect(component).toHaveClass(customClass);\n  });\n});\n';

// 生成Storybook模板
const storyTemplate = 'import React from \'react\';\nimport { Meta, StoryFn } from \'@storybook/react\';\nimport ' + componentName + ', { ' + componentName + 'Props } from \'./' + componentName + '\';\n\nconst meta: Meta<' + componentName + 'Props> = {\n  title: \'' + componentName + '\',\n  component: ' + componentName + ',\n  argTypes: {\n    color: {\n      control: {\n        type: \'color\',\n      },\n    },\n    disabled: {\n      control: {\n        type: \'boolean\',\n      },\n    },\n    onClick: {\n      action: \'clicked\',\n    },\n  },\n};\n\nexport default meta;\n\ntype ' + componentName + 'StoryProps = ' + componentName + 'Props;\n\nconst Template: StoryFn<' + componentName + 'StoryProps> = (args) => <' + componentName + ' {...args} />;\n\nexport const Default = Template.bind({});\nDefault.args = {\n  children: \'' + componentName + '\',\n};\n\nexport const CustomColor = Template.bind({});\nCustomColor.args = {\n  children: \'自定义颜色\',\n  color: \'#10B981\',\n};\n\nexport const Disabled = Template.bind({});\nDisabled.args = {\n  children: \'禁用状态\',\n  disabled: true,\n};\n\nexport const Large = Template.bind({});\nLarge.args = {\n  children: \'大型' + componentName + '\',\n  style: {\n    padding: \'16px 24px\',\n    fontSize: \'18px\',\n  },\n};\n';

// 写入文件
fs.writeFileSync(componentPath, componentTemplate);
console.log(`✓ 生成组件：${componentPath}`);

fs.writeFileSync(testPath, testTemplate);
console.log(`✓ 生成测试文件：${testPath}`);

fs.writeFileSync(storyPath, storyTemplate);
console.log(`✓ 生成Storybook：${storyPath}`);

console.log(`\n✅ ${componentName}组件生成完成！`);
console.log('\n生成的文件：');
console.log(`- ${componentPath}`);
console.log(`- ${testPath}`);
console.log(`- ${storyPath}`);
console.log('\n使用建议：');
console.log('1. 在项目中导入使用组件');
console.log('2. 运行测试：npm test');
console.log('3. 查看Storybook：npm run storybook');
