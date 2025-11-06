 import React from "react";

export default function Loading() {
  return (
    <main className="grid min-h-screen w-full place-items-center">
      <div className="">
        <span className="animate-spin h-5 w-5"></span>
        <p className="text-primary text-xl font-bold">Loading</p>
      </div>
    </main>
  );
}
