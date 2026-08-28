import { Suspense } from "react";
import { GetStartedForm } from "./get-started-form";

export default function GetStartedPage() {
  return (
    <Suspense>
      <GetStartedForm />
    </Suspense>
  );
}
