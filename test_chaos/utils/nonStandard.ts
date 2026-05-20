// 非标准格式测试

@decorator1
@decorator2({ option: 'value' })
export @weirdModifier class WeirdClass {
    @propertyDecorator
    public @weirdField field: @weirdType = @weirdValue

    @methodDecorator
    public async @weirdMethod(): @weirdReturnType {
        if (condition) @weirdStatement
        return @weirdValue
    }
}

@weirdExport const weirdExport = @weirdAssignment

namespace @weirdNamespace {
    @weirdDeclare const weirdConst: @weirdType = @weirdValue
}
