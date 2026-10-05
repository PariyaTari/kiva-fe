declare module "react-element-popper/animations/transition" {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	const transition: (options?: { from?: number; transition?: string; duration?: number }) => Function;
	export default transition;
}

declare module "react-element-popper/animations/opacity" {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	const opacity: (options?: { from?: number; to?: number; duration?: number }) => Function;
	export default opacity;
}
