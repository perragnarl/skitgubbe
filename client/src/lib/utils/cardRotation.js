export function cardRotation(index, total) {
	const multiplier = total * 4;
	const middle = Math.floor(total / 2);
	const distance = index - middle;
	const angle = distance * multiplier;
	const translateX = distance * (multiplier * 2) * -1;
	if (angle === 0)
		return `translateY(-${multiplier}px) translateX(${translateX}px)`;
	return `rotate(${angle}deg) translateX(${translateX}px)`;
}
