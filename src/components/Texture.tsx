import Image from "next/image";

type Props = {
  name: "paper" | "horizon" | "contours" | "night" | "stone" | "bronze";
  className?: string;
};

/** Decorative abstract texture filling its (relatively positioned) parent. */
export function Texture({ name, className = "" }: Props) {
  return (
    <Image
      src={`/textures/${name}.jpg`}
      alt=""
      aria-hidden="true"
      fill
      sizes="100vw"
      className={`pointer-events-none object-cover select-none ${className}`}
    />
  );
}
