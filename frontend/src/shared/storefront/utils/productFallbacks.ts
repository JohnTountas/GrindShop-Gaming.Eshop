import type { ProductLike, ReviewSnapshot, StorefrontSpecification } from '../types';

function hashValue(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

export function buildTechnicalSpecs(product: ProductLike): StorefrontSpecification[] {
  const seed = hashValue(`${product.id}:${product.title}`);
  const category = `${product.category?.name ?? ''} ${product.category?.slang ?? ''}`.toLowerCase();

  if (category.includes('desktop') || category.includes('pc')) {
    const cpu = ['Ryzen 9 9900X', 'Core i9-14900K', 'Ryzen 7 9800X3D'][seed % 3];
    const gpu = ['RTX 5080', 'RTX 5070 Ti', 'RX 8900 XT'][seed % 3];
    const ram = ['32GB DDR5 6000MHz', '64GB DDR5 5600MHz', '32GB DDR5 6400MHz'][seed % 3];
    const storage = ['2TB NVMe Gen4', '1TB NVMe Gen5 + 2TB SSD', '4TB NVMe Gen4'][seed % 3];

    return [
      { label: 'CPU', value: cpu },
      { label: 'GPU', value: gpu },
      { label: 'Memory', value: ram },
      { label: 'Storage', value: storage },
      {
        label: 'Cooling',
        value: ['360mm AIO', 'Dual-tower air cooler', 'Custom liquid loop'][seed % 3],
      },
      { label: 'Warranty', value: '36 months pickup & return' },
    ];
  }

  if (category.includes('monitor')) {
    return [
      { label: 'Panel Type', value: ['Fast IPS', 'OLED', 'Mini-LED'][seed % 3] },
      { label: 'Resolution', value: ['2560x1440', '3840x2160', '3440x1440'][seed % 3] },
      { label: 'Refresh Rate', value: ['165Hz', '240Hz', '360Hz'][seed % 3] },
      { label: 'Response Time', value: ['0.03ms', '0.5ms', '1ms'][seed % 3] },
      { label: 'Adaptive Sync', value: 'AMD FreeSync Premium / G-SYNC Compatible' },
      { label: 'Connectivity', value: 'HDMI 2.1, DisplayPort 1.4, USB-C' },
    ];
  }

  if (category.includes('keyboard')) {
    return [
      { label: 'Switch Type', value: ['Linear', 'Tactile', 'Magnetic Hall-Effect'][seed % 3] },
      { label: 'Layout', value: ['60%', '75%', 'TKL'][seed % 3] },
      { label: 'Connectivity', value: ['USB-C', '2.4GHz + USB-C', 'Tri-mode'][seed % 3] },
      { label: 'Polling Rate', value: ['1000Hz', '4000Hz', '8000Hz'][seed % 3] },
      { label: 'Keycaps', value: 'Double-shot PBT' },
      { label: 'Software', value: 'Macro mapping and per-key RGB profiles' },
    ];
  }

  if (category.includes('mouse')) {
    return [
      { label: 'Sensor', value: ['PixArt PAW3395', 'PixArt PAW3950', 'Focus Pro'][seed % 3] },
      { label: 'Max DPI', value: ['26000 DPI', '30000 DPI', '36000 DPI'][seed % 3] },
      { label: 'Weight', value: ['54g', '63g', '72g'][seed % 3] },
      { label: 'Polling Rate', value: ['1000Hz', '4000Hz', '8000Hz'][seed % 3] },
      { label: 'Switches', value: 'Optical 90M click lifecycle' },
      { label: 'Connectivity', value: ['Wired', 'Wireless 2.4GHz', 'Dual-mode'][seed % 3] },
    ];
  }

  if (category.includes('headset')) {
    return [
      { label: 'Driver Size', value: ['40mm', '50mm', '53mm'][seed % 3] },
      {
        label: 'Microphone',
        value: ['Detachable cardioid', 'Flip-to-mute boom', 'Broadcast-grade boom'][seed % 3],
      },
      { label: 'Surround', value: ['Stereo', 'Virtual 7.1', 'Spatial 3D'][seed % 3] },
      { label: 'Battery', value: ['40 hours', '55 hours', '70 hours'][seed % 3] },
      { label: 'Connection', value: ['USB-C', '2.4GHz Wireless', 'Bluetooth + 2.4GHz'][seed % 3] },
      { label: 'Weight', value: ['245g', '278g', '301g'][seed % 3] },
    ];
  }

  return [
    { label: 'Build', value: 'Premium gaming-grade construction' },
    { label: 'Performance', value: 'Validated for competitive workloads' },
    { label: 'Reliability', value: 'Quality-tested before dispatch' },
  ];
}

export function buildReviewSnapshot(product: ProductLike): ReviewSnapshot {
  const seed = hashValue(`${product.id}:${product.title}:reviews`);
  const rating = Number((4.2 + (seed % 8) * 0.1).toFixed(1));
  const totalReviews = 84 + (seed % 420);

  const fiveStar = Math.round(totalReviews * (0.52 + (seed % 10) * 0.02));
  const fourStar = Math.round(totalReviews * (0.26 + (seed % 6) * 0.01));
  const threeStar = Math.round(totalReviews * 0.11);
  const twoStar = Math.round(totalReviews * 0.06);
  const oneStar = Math.max(1, totalReviews - fiveStar - fourStar - threeStar - twoStar);

  const counts = [fiveStar, fourStar, threeStar, twoStar, oneStar];
  const breakdown = [5, 4, 3, 2, 1].map((stars, index) => ({
    stars,
    count: counts[index],
    percent: Math.round((counts[index] / totalReviews) * 100),
  }));

  return {
    rating,
    totalReviews,
    breakdown,
    quotes: [
      'Frame consistency improved immediately after setup.',
      'Build quality and packaging exceeded expectations.',
      'Fast delivery and zero setup friction.',
    ],
  };
}
