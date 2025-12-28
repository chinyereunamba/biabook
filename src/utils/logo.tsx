import type { SVGProps } from "react";

const Logo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 82.82962 36.15036"
      {...props}
    >
      <circle cx="18.07518" cy="18.07517" r="18.07518" fill="#1e57ba" />

      <text
        x="6.6217"
        y="24.3163"
        fontSize="17.6389"
        fontFamily="Google Sans Flex, sans-serif"
        fontWeight="600"
        letterSpacing="-0.132292"
        fill="#ffffff"
      >
        bia
      </text>

      <text
        x="35.6721"
        y="23.9273"
        fontSize="17.6389"
        fontFamily="Google Sans Flex, sans-serif"
        fontWeight="600"
        fill="#1e57ba"
      >
        book
      </text>
    </svg>
  );
};


export { Logo };
