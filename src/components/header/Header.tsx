"use client";
import React from "react";
import { ModeToggle } from "../theme/ToggleButton";
import { usePathname, useRouter } from "next/navigation";

const Header = () => {
  const path = usePathname();
  const router = useRouter();

  return (
    <div className="flex justify-between p-2.5 ">
      <div className="left self-start">
        <h1
          className={`text-[24px] font-bold ${
            path === "/" ? "cursor-default" : "cursor-pointer"
          }`}
          onClick={() => {
            path !== "/" && router.push("/");
          }}
        >
          Next-Auth
        </h1>
      </div>
      <div className="right self-end">
        <ModeToggle />
      </div>
    </div>
  );
};

export default Header;
