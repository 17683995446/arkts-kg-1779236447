// 大量嵌套和复杂结构测试

import { Type1, Type2, Type3, Type4, Type5 } from './types';
import { func1, func2, func3 } from './functions';
import * as Utils from './utils';

type ComplexType<T, U, V> = {
    field1: T;
    field2: U;
    field3: V;
    nested: {
        deep: {
            deeper: {
                deepest: T[];
            };
        };
    };
    array: Array<{
        item: {
            value: U;
            metadata: {
                created: Date;
                modified: Date;
                tags: string[];
            };
        };
    }>;
};

interface ComplexInterface<T> {
    genericMethod<K extends keyof T>(key: K): T[K];
    asyncMethod(): Promise<ComplexType<any, any, any>>;
    callbackMethod(callback: (error: Error | null, result?: any) => void): void;
    overloadedMethod(param: string): string;
    overloadedMethod(param: number): number;
    overloadedMethod(param: boolean): boolean;
}

export class ComplexClass<T extends string | number, U extends object>
    implements ComplexInterface<T> {

    private readonly privateField: T;
    protected readonly protectedField: U;
    public static readonly staticField: string = 'static';

    constructor(
        private param1: T,
        private param2: U,
        private readonly param3?: ComplexType<T, U, any>
    ) {
        this.privateField = param1;
        this.protectedField = param2;
    }

    public genericMethod<K extends keyof T>(key: K): T[K] {
        return this.privateField[key];
    }

    public async asyncMethod(): Promise<ComplexType<any, any, any>> {
        return {
            field1: this.privateField,
            field2: this.protectedField,
            field3: null,
            nested: {
                deep: {
                    deeper: {
                        deepest: []
                    }
                }
            },
            array: []
        };
    }

    public callbackMethod(callback: (error: Error | null, result?: any) => void): void {
        try {
            const result = this.asyncMethod();
            callback(null, result);
        } catch (error) {
            callback(error as Error);
        }
    }

    public overloadedMethod(param: string | number | boolean): string | number | boolean {
        if (typeof param === 'string') {
            return param.toUpperCase();
        } else if (typeof param === 'number') {
            return param * 2;
        }
        return !param;
    }

    private nestedMethod(): void {
        const arr = [1, 2, 3, 4, 5];
        const mapped = arr
            .filter(x => x > 2)
            .map(x => x * 2)
            .reduce((acc, x) => acc + x, 0);

        const obj = {
            level1: {
                level2: {
                    level3: {
                        level4: {
                            value: mapped
                        }
                    }
                }
            }
        };

        console.log(obj.level1.level2.level3.level4.value);
    }

    protected getProtectedData(): U {
        return this.protectedField;
    }

    public static staticMethod(): void {
        console.log(ComplexClass.staticField);
    }
}

export const complexArrowFunction = <T, U, V>(
    param1: T,
    param2: U,
    param3?: V
): ComplexType<T, U, V> => {
    return {
        field1: param1,
        field2: param2,
        field3: param3,
        nested: {
            deep: {
                deeper: {
                    deepest: []
                }
            }
        },
        array: []
    };
};

export default ComplexClass;

// Test modification 0

// Test modification 1

// Test modification 2

// Test modification 3

// Test modification 4

// Test modification 5

// Test modification 6

// Test modification 7

// Test modification 8

// Test modification 9

// Test modification 10

// Test modification 11

// Test modification 12

// Test modification 13

// Test modification 14

// Test modification 15

// Test modification 16

// Test modification 17

// Test modification 18

// Test modification 19

// Performance test 0

// Performance test 1

// Performance test 2

// Performance test 3

// Performance test 4

// Performance test 5

// Performance test 6

// Performance test 7

// Performance test 8

// Performance test 9

// Performance test 10

// Performance test 11

// Performance test 12

// Performance test 13

// Performance test 14

// Performance test 15

// Performance test 16

// Performance test 17

// Performance test 18

// Performance test 19

// Performance test 20

// Performance test 21

// Performance test 22

// Performance test 23

// Performance test 24

// Performance test 25

// Performance test 26

// Performance test 27

// Performance test 28

// Performance test 29

// Performance test 30

// Performance test 31

// Performance test 32

// Performance test 33

// Performance test 34

// Performance test 35

// Performance test 36

// Performance test 37

// Performance test 38

// Performance test 39

// Performance test 40

// Performance test 41

// Performance test 42

// Performance test 43

// Performance test 44

// Performance test 45

// Performance test 46

// Performance test 47

// Performance test 48

// Performance test 49

// Performance test 50

// Performance test 51

// Performance test 52

// Performance test 53

// Performance test 54

// Performance test 55

// Performance test 56

// Performance test 57

// Performance test 58

// Performance test 59

// Performance test 60

// Performance test 61

// Performance test 62

// Performance test 63

// Performance test 64

// Performance test 65

// Performance test 66

// Performance test 67

// Performance test 68

// Performance test 69

// Performance test 70

// Performance test 71

// Performance test 72

// Performance test 73

// Performance test 74

// Performance test 75

// Performance test 76

// Performance test 77

// Performance test 78

// Performance test 79

// Performance test 80

// Performance test 81

// Performance test 82

// Performance test 83

// Performance test 84

// Performance test 85

// Performance test 86

// Performance test 87

// Performance test 88

// Performance test 89

// Performance test 90

// Performance test 91

// Performance test 92

// Performance test 93

// Performance test 94

// Performance test 95

// Performance test 96

// Performance test 97

// Performance test 98

// Performance test 99
