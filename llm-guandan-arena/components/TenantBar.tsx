"use client";

import { useEffect, useState } from "react";
import { lockTenant, readLockedTenant, unlockTenant } from "@/lib/tenant-client";

export function TenantBar({
  locked,
  onLocked,
  readOnly = false,
}: {
  locked: string | null;
  onLocked: (tenant: string | null) => void;
  readOnly?: boolean;
}) {
  const [draft, setDraft] = useState(locked || "default");

  useEffect(() => {
    const saved = readLockedTenant();
    if (saved) {
      setDraft(saved);
      onLocked(saved);
    }
    // Lobby owns the lock. Re-read once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (locked) setDraft(locked);
  }, [locked]);

  return (
    <header className="tenant-bar" data-testid="tenant-bar">
      <span className="eyebrow">租户</span>
      {locked ? (
        <>
          <strong data-testid="tenant-name">{locked}</strong>
          <em>已锁定 · 列表只含这一户</em>
          {readOnly ? null : (
            <button
              className="chip-btn tiny"
              type="button"
              data-testid="tenant-unlock"
              onClick={() => {
                unlockTenant();
                onLocked(null);
              }}
            >
              更换
            </button>
          )}
        </>
      ) : (
        <form
          className="tenant-lock"
          onSubmit={(event) => {
            event.preventDefault();
            onLocked(lockTenant(draft));
          }}
        >
          <input
            data-testid="tenant-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label="租户名"
            maxLength={64}
          />
          <button className="chip-btn on" type="submit" data-testid="tenant-lock">
            锁定
          </button>
          <em>锁定后才列房间</em>
        </form>
      )}
    </header>
  );
}
