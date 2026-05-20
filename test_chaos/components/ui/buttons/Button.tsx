// test_chaos/components/ui/buttons/Button.tsx - 大文件测试 (1000+ 行)

// 模拟大型组件库
// 这是一个虚构的按钮组件，用于测试解析器处理大文件的能力

import React, { useState, useEffect, useRef, useCallback } from 'react';
import classNames from 'classnames';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonType = 'button' | 'submit' | 'reset';

export interface ButtonProps {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    type?: ButtonType;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    style?: React.CSSProperties;
    id?: string;
    'data-testid'?: string;
    'aria-label'?: string;
    'aria-describedby'?: string;
    tabIndex?: number;
    autoFocus?: boolean;
    form?: string;
    name?: string;
    value?: string;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    loading = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    onClick,
    className,
    style,
    id,
    'data-testid': testId,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    tabIndex,
    autoFocus,
    form,
    name,
    value
}) => {
    const [isPressed, setIsPressed] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (autoFocus && buttonRef.current) {
            buttonRef.current.focus();
        }
    }, [autoFocus]);

    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if (onClick) {
            onClick(event);
        }
    }, [disabled, loading, onClick]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === ' ' || event.key === 'Enter') {
            setIsPressed(true);
        }

        if (event.key === 'Escape') {
            setIsFocused(false);
            buttonRef.current?.blur();
        }
    }, []);

    const handleKeyUp = useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === ' ' || event.key === 'Enter') {
            setIsPressed(false);
        }
    }, []);

    const handleFocus = useCallback((event: React.FocusEvent<HTMLButtonElement>) => {
        setIsFocused(true);
    }, []);

    const handleBlur = useCallback((event: React.FocusEvent<HTMLButtonElement>) => {
        setIsFocused(false);
        setIsPressed(false);
    }, []);

    const handleMouseDown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled && !loading) {
            setIsPressed(true);
        }
    }, [disabled, loading]);

    const handleMouseUp = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        setIsPressed(false);
    }, []);

    const handleMouseLeave = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        setIsPressed(false);
    }, []);

    const classNameString = classNames(
        styles.button,
        styles[`button--${variant}`],
        styles[`button--${size}`],
        {
            [styles['button--disabled']]: disabled,
            [styles['button--loading']]: loading,
            [styles['button--full-width']]: fullWidth,
            [styles['button--pressed']]: isPressed,
            [styles['button--focused']]: isFocused,
        },
        className
    );

    return (
        <button
            ref={buttonRef}
            type={type}
            className={classNameString}
            disabled={disabled || loading}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            id={id}
            data-testid={testId}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-disabled={disabled || loading}
            tabIndex={tabIndex}
            form={form}
            name={name}
            value={value}
            style={style}
        >
            {loading && (
                <span className={styles['button__loader']}>
                    <span className={styles['button__loader-spinner']}></span>
                </span>
            )}

            {icon && iconPosition === 'left' && !loading && (
                <span className={styles['button__icon']}>{icon}</span>
            )}

            <span className={styles['button__text']}>{children}</span>

            {icon && iconPosition === 'right' && !loading && (
                <span className={styles['button__icon']}>{icon}</span>
            )}
        </button>
    );
};

export default Button;

// 额外的工具函数和类型定义

export const buttonVariants: ButtonVariant[] = [
    'primary',
    'secondary',
    'danger',
    'success',
    'warning',
    'info',
    'outline'
];

export const buttonSizes: ButtonSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

export const buttonTypes: ButtonType[] = ['button', 'submit', 'reset'];

export const getButtonVariantClass = (variant: ButtonVariant): string => {
    return styles[`button--${variant}`] || '';
};

export const getButtonSizeClass = (size: ButtonSize): string => {
    return styles[`button--${size}`] || '';
};

export const isValidButtonVariant = (variant: string): variant is ButtonVariant => {
    return buttonVariants.includes(variant as ButtonVariant);
};

export const isValidButtonSize = (size: string): size is ButtonSize => {
    return buttonSizes.includes(size as ButtonSize);
};

export const isValidButtonType = (type: string): type is ButtonType => {
    return buttonTypes.includes(type as ButtonType);
};

export const getButtonAriaDisabled = (disabled: boolean, loading: boolean): boolean => {
    return disabled || loading;
};

export const getButtonTabIndex = (disabled: boolean, tabIndex?: number): number | undefined => {
    if (disabled) {
        return -1;
    }
    return tabIndex;
};

// Hooks

export const useButtonState = (initialState: boolean = false) => {
    const [state, setState] = useState(initialState);
    const toggle = useCallback(() => setState(s => !s), []);
    const setTrue = useCallback(() => setState(true), []);
    const setFalse = useCallback(() => setState(false), []);
    return { state, toggle, setTrue, setFalse, setState };
};

// Context

export interface ButtonGroupContextValue {
    size?: ButtonSize;
    variant?: ButtonVariant;
    disabled?: boolean;
}

export const ButtonGroupContext = React.createContext<ButtonGroupContextValue>({});

export const useButtonGroup = (): ButtonGroupContextValue => {
    return React.useContext(ButtonGroupContext);
};

// 高阶组件

export const withButtonLoading = <P extends object>(
    Component: React.ComponentType<P>
): React.FC<P & { loading?: boolean }> => {
    return ({ loading, ...props }) => {
        if (loading) {
            return <Button disabled loading>Loading...</Button>;
        }
        return <Component {...(props as P)} />;
    };
};

// 更多工具函数...

export const validateButtonProps = (props: ButtonProps): string[] => {
    const errors: string[] = [];

    if (!children && !props.icon) {
        errors.push('Button must have either children or an icon');
    }

    if (props.fullWidth && !props.onClick) {
        errors.push('Full width buttons should have an onClick handler');
    }

    if (props.loading && props.disabled) {
        errors.push('Button cannot be both loading and disabled');
    }

    return errors;
};

export const getButtonAriaRole = (props: ButtonProps): string => {
    if (props.type === 'submit') {
        return 'button';
    }
    return 'button';
};

// 样式映射

export const buttonVariantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
        backgroundColor: '#007bff',
        color: '#ffffff'
    },
    secondary: {
        backgroundColor: '#6c757d',
        color: '#ffffff'
    },
    danger: {
        backgroundColor: '#dc3545',
        color: '#ffffff'
    },
    success: {
        backgroundColor: '#28a745',
        color: '#ffffff'
    },
    warning: {
        backgroundColor: '#ffc107',
        color: '#212529'
    },
    info: {
        backgroundColor: '#17a2b8',
        color: '#ffffff'
    },
    outline: {
        backgroundColor: 'transparent',
        border: '1px solid #007bff',
        color: '#007bff'
    }
};

export const buttonSizeStyles: Record<ButtonSize, React.CSSProperties> = {
    xs: {
        padding: '0.25rem 0.5rem',
        fontSize: '0.75rem'
    },
    sm: {
        padding: '0.375rem 0.75rem',
        fontSize: '0.875rem'
    },
    md: {
        padding: '0.5rem 1rem',
        fontSize: '1rem'
    },
    lg: {
        padding: '0.75rem 1.5rem',
        fontSize: '1.125rem'
    },
    xl: {
        padding: '1rem 2rem',
        fontSize: '1.25rem'
    }
};
