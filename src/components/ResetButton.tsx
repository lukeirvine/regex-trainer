"use client";

import { useRef, useTransition } from "react";
import { resetProgress } from "@/app/actions";
import type { Mode } from "@/content/types";

export function ResetButton({ mode, completed, total }: { mode: Mode; completed: number; total: number }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      await resetProgress(mode);
      dialog.current?.close();
    });
  }

  return (
    <>
      <button className="btn btn-outline btn-sm" onClick={() => dialog.current?.showModal()}>
        Start over
      </button>
      <dialog ref={dialog} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Start over?</h3>
          <p className="py-4">
            This clears your checkmarks so you can run through every item again. Your current progress (
            <strong>
              {completed}/{total}
            </strong>
            ) is saved to your reset history.
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost" disabled={pending}>
                Cancel
              </button>
            </form>
            <button className="btn btn-error" onClick={confirm} disabled={pending}>
              {pending && <span className="loading loading-spinner loading-sm" />}
              Start over
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
