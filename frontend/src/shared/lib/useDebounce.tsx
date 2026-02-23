import {useEffect, useState} from "react";

type Props = {
    value: any,
    ms: number
}

const useDebounce = ({
    value, ms
}: Props) => {
    const [debounceValue, setDebounceValue] = useState()

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounceValue(value)
        }, ms)

        return () => clearTimeout(timer)
    }, [value]);

    return debounceValue
}

export {useDebounce}