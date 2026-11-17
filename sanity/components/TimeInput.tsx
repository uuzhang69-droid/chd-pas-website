import { set, unset, type StringInputProps } from "sanity";

export function TimeInput(props: StringInputProps) {
    const { value, onChange, readOnly } = props;

    return (
        <input
            type="time"
            step={60}
            value={value ?? ""}
            disabled={readOnly}
            onChange={(event) => {
                const nextValue = event.currentTarget.value;

                onChange(
                    nextValue ? set(nextValue) : unset()
                );
            }}
            style={{
                width: "100%",
                padding: "12px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                font: "inherit",
                colorScheme: "light",
            }}
        />
    );
}