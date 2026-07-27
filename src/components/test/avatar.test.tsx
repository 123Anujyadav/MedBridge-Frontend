import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, waitFor, cleanup, fireEvent } from "@testing-library/react";

import { AvatarUploader } from "@/components/shared/AvatarUploader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  initialsFrom,
  resolveAvatarThumbUrl,
  resolveAvatarUrl,
  validateAvatarFile,
} from "@/lib/avatar";

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const STORED = "/uploads/avatars/deadbeefdeadbeefdeadbeefdeadbeef.webp";

function pngFile(name = "photo.png", type = "image/png", size = 1024): File {
  const file = new File([new Uint8Array(size)], name, { type });
  // jsdom does not let File.size be set from a small buffer reliably.
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("avatar url resolution", () => {
  it("maps a stored path onto the API's image route", () => {
    expect(resolveAvatarUrl(STORED)).toContain(
      "/shared/avatars/deadbeefdeadbeefdeadbeefdeadbeef.webp"
    );
  });

  it("returns undefined when there is no photo", () => {
    expect(resolveAvatarUrl(undefined)).toBeUndefined();
    expect(resolveAvatarUrl(null)).toBeUndefined();
    expect(resolveAvatarUrl("")).toBeUndefined();
  });

  it("passes through absolute and preview urls untouched", () => {
    expect(resolveAvatarUrl("https://cdn.example.com/a.png")).toBe(
      "https://cdn.example.com/a.png"
    );
    expect(resolveAvatarUrl("blob:http://localhost/abc")).toBe(
      "blob:http://localhost/abc"
    );
  });

  it("does not turn an arbitrary stored path into an image url", () => {
    // Only the avatars directory is servable; a report path must not resolve.
    expect(resolveAvatarUrl("/uploads/reports/secret.pdf")).toBeUndefined();
  });

  it("requests the thumbnail rendition for compact circles", () => {
    expect(resolveAvatarThumbUrl(STORED)).toContain("_thumb.webp");
  });

  it("derives initials for the fallback", () => {
    expect(initialsFrom("Asha Verma")).toBe("AV");
    expect(initialsFrom("Madonna")).toBe("M");
    expect(initialsFrom("")).toBe("U");
  });
});

describe("client-side file validation", () => {
  it("accepts jpeg, png and webp", () => {
    expect(validateAvatarFile(pngFile("a.png", "image/png"))).toBeNull();
    expect(validateAvatarFile(pngFile("a.jpg", "image/jpeg"))).toBeNull();
    expect(validateAvatarFile(pngFile("a.webp", "image/webp"))).toBeNull();
  });

  it("rejects a non-image type", () => {
    expect(validateAvatarFile(pngFile("a.pdf", "application/pdf"))).toMatch(/JPEG/);
    expect(validateAvatarFile(pngFile("a.exe", "application/x-msdownload"))).toBeTruthy();
    expect(validateAvatarFile(pngFile("a.svg", "image/svg+xml"))).toBeTruthy();
  });

  it("rejects a file over the size ceiling", () => {
    expect(
      validateAvatarFile(pngFile("big.png", "image/png", 6 * 1024 * 1024))
    ).toMatch(/MB/);
  });
});

describe("UserAvatar", () => {
  afterEach(cleanup);

  it("shows initials when there is no photo", () => {
    render(<UserAvatar name="Asha Verma" />);
    expect(screen.getByText("AV")).toBeTruthy();
  });

  it("shows the photo when one is set", () => {
    render(<UserAvatar avatarUrl={STORED} name="Asha Verma" />);
    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.src).toContain("deadbeefdeadbeefdeadbeefdeadbeef.webp");
  });

  it("falls back to initials if the image fails to load", async () => {
    render(<UserAvatar avatarUrl={STORED} name="Asha Verma" />);
    fireEvent.error(screen.getByRole("img"));
    await waitFor(() => expect(screen.getByText("AV")).toBeTruthy());
  });
});

describe("AvatarUploader", () => {
  let originalCreate: typeof URL.createObjectURL;
  let originalRevoke: typeof URL.revokeObjectURL;

  beforeEach(() => {
    originalCreate = URL.createObjectURL;
    originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => "blob:preview-url");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    cleanup();
    vi.clearAllMocks();
  });

  const setup = (props: Partial<React.ComponentProps<typeof AvatarUploader>> = {}) => {
    const onUpload = vi.fn().mockResolvedValue({});
    const onRemove = vi.fn().mockResolvedValue({});
    render(
      <AvatarUploader
        name="Asha Verma"
        onUpload={onUpload}
        onRemove={onRemove}
        {...props}
      />
    );
    return { onUpload, onRemove };
  };

  const pick = async (file: File) => {
    const input = screen.getByTestId("avatar-file-input") as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
  };

  it("previews the chosen photo without uploading it", async () => {
    const { onUpload } = setup();
    await pick(pngFile());

    // The photo is shown, but nothing has been sent yet.
    expect(screen.getByText(/not saved yet/i)).toBeTruthy();
    expect(onUpload).not.toHaveBeenCalled();
    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.src).toContain("blob:preview-url");
  });

  it("uploads only once the preview is confirmed", async () => {
    const { onUpload } = setup();
    const file = pngFile();
    await pick(file);

    await act(async () => {
      screen.getByText(/save photo/i).click();
    });

    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it("discards the preview on cancel", async () => {
    const { onUpload } = setup();
    await pick(pngFile());

    await act(async () => {
      screen.getByText(/cancel/i).click();
    });

    expect(onUpload).not.toHaveBeenCalled();
    expect(screen.queryByText(/not saved yet/i)).toBeNull();
  });

  it("rejects a disallowed file before any request is made", async () => {
    const { onUpload } = setup();
    await pick(pngFile("bad.pdf", "application/pdf"));

    expect(onUpload).not.toHaveBeenCalled();
    expect(screen.queryByText(/not saved yet/i)).toBeNull();
  });

  it("offers removal only when a photo exists", async () => {
    const { onRemove } = setup({ avatarUrl: STORED });
    await act(async () => {
      screen.getByText(/remove/i).click();
    });
    expect(onRemove).toHaveBeenCalled();
  });

  it("does not offer removal when there is no photo", () => {
    setup();
    expect(screen.queryByText(/remove/i)).toBeNull();
    expect(screen.getByText(/upload photo/i)).toBeTruthy();
  });
});
