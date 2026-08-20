import { Image as ImageIcon, Upload } from 'lucide-react';

export default function ImagePlaceholder({ label = 'Project image', aspect = 'landscape', className = '' }) {
  return <div className={`image-placeholder image-placeholder--${aspect} ${className}`} role="img" aria-label={`${label} placeholder`}>
    <span className="image-placeholder__beam" aria-hidden="true" />
    <div><ImageIcon aria-hidden="true" /><strong>{label}</strong><small>Approved image placement</small></div>
    <Upload className="image-placeholder__corner" aria-hidden="true" />
  </div>;
}
