const Loader = () => {
    return (
        <div className="flex h-full w-full py-20 items-center justify-center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                className="aspect-square small-loader-container w-[100px]"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid">
                <circle
                    cx="50"
                    cy="50"
                    r="30"
                    strokeWidth="8"
                    stroke="white"
                    strokeDasharray="47.12388980384689 47.12388980384689"
                    fill="none"
                    strokeLinecap="round">
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        repeatCount="indefinite"
                        dur="1s"
                        keyTimes="0;1"
                        values="0 50 50;360 50 50"
                    />
                </circle>
            </svg>
        </div>
    )
}
export default Loader