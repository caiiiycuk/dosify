const timefn = Date.now;

export default function setTime(time: number) {
    const offset = timefn() - time;
    Date.now = () => {
        return timefn() - offset;
    };
}