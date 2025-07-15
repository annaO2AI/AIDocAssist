type IconProps = {
    width?: number;
    height?: number;
    color?: string;
    className?: string;
  };
  
  export default function HomeIcon({
    width = 24,
    height = 24,
    color = "currentColor",
    className = "",
  }: IconProps) {
    return (
      <svg
        className={className}
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M3 10L12 2L21 10V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V10Z" />
      </svg>
    );
  }