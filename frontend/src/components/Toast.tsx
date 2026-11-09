type ToastProps = {
  teks: string;
  jenis: "sukses" | "gagal";
};
 
export default function Toast({ teks, jenis }: ToastProps) {
  return <div className={`toast ${jenis}`} role="status">{teks}</div>;
}