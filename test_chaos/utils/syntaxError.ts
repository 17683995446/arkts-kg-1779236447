// 语法错误文件测试
// 这用于测试解析器处理语法错误的容错能力

const broken = {
    name: "test"
    age: 25  // 缺少逗号

function brokenFunction( {
    return "broken"
}

class BrokenClass {
    method( {
        // 未闭合的括号
    }
}
