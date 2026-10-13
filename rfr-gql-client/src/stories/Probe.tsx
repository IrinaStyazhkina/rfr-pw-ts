import {FC} from "react";

/*
 * A hidden form that exposes story state to Playwright, one input per value,
 * because callbacks cannot cross from the browser into the test.
 */
interface ProbeInterface {
    values: Record<string, unknown>;
}

export const Probe: FC<ProbeInterface> = ({values}) => (
    <form hidden>
        {Object.entries(values).map(([name, value]) => (
            <input key={name} data-testid={name} readOnly value={typeof value === "string" ? value : JSON.stringify(value)}/>
        ))}
    </form>
);
