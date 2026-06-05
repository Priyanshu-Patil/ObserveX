import { Input } from './Input';
import styles from '../../styles/modules/ui/SharedUi.module.scss';

export function FormField({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    hint,
    required,
    children,
    ...props
}) {
    return (
        <div className={styles.formField}>
            {label && (
                <label htmlFor={name} className={styles.formLabel}>
                    {label}
                    {required && <span className={styles.required} aria-hidden="true">*</span>}
                </label>
            )}
            {children ?? (
                <Input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
                    {...props}
                />
            )}
            {error && <span id={`${name}-error`} className={styles.formError} role="alert">{error}</span>}
            {hint && !error && <span id={`${name}-hint`} className={styles.formHint}>{hint}</span>}
        </div>
    );
}
