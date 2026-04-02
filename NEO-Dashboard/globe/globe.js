let globeInstance = null;

function initGlobe(neoData) {
  const el = document.getElementById('globe-container');
  if (!el) return;

  // --- Parse NEO data ---
  const allNEOs = [];
  Object.values(neoData.near_earth_objects).forEach(dayList => {
    dayList.forEach(neo => {
      const approach = neo.close_approach_data[0];
      const missKm = parseFloat(approach.miss_distance.kilometers);
      const missLD = missKm / CONFIG.LUNAR_DISTANCE_KM;
      const avgDiam = (
        neo.estimated_diameter.meters.estimated_diameter_min +
        neo.estimated_diameter.meters.estimated_diameter_max
      ) / 2;
      allNEOs.push({
        name: neo.name.replace(/[()]/g, '').trim(),
        missKm,
        missLD,
        isHazardous: neo.is_potentially_hazardous_asteroid,
        date: approach.close_approach_date,
        velocity: parseFloat(approach.relative_velocity.kilometers_per_second).toFixed(2),
        diameter: avgDiam.toFixed(0),
        avgDiam,
        isMoon: false,
      });
    });
  });

  allNEOs.sort((a, b) => a.missLD - b.missLD);

  // Logarithmic altitude mapping: near-misses at low alt, far ones higher
  // 0.01 LD → ~0.25, 1 LD → ~0.9, 10 LD → ~2.0, 50 LD → ~3.0
  const toAlt = ld => 0.25 + (Math.log10(Math.max(ld, 0.01) + 1) / Math.log10(52)) * 2.75;

  // Spread asteroids using golden-angle distribution so they don't cluster
  const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
  const asteroidObjects = allNEOs.map((neo, i) => {
    const lat = 90 - (i / allNEOs.length) * 180;
    const lng = ((i * phi * 180) / Math.PI) % 360 - 180;
    return { ...neo, lat, lng, alt: toAlt(neo.missLD) };
  });

  // Moon at 1 LD — fixed position near ecliptic plane
  const moonAlt = toAlt(1.0);
  const moonObject = {
    name: 'Moon',
    isMoon: true,
    lat: 5,
    lng: 90,
    alt: moonAlt,
    missLD: 1.0,
    missKm: CONFIG.LUNAR_DISTANCE_KM,
    isHazardous: false,
    date: '—',
    velocity: '—',
    diameter: '3474000',
    avgDiam: 3474000,
  };

  const allObjects = [...asteroidObjects, moonObject];

  // --- Build Three.js sphere factory ---
  function makeSphere(d) {
    if (d.isMoon) {
      const geo = new THREE.SphereGeometry(8, 32, 32);
      const mat = new THREE.MeshPhongMaterial({
        color: 0xaaaaaa,
        emissive: 0x333333,
        shininess: 15,
      });
      return new THREE.Mesh(geo, mat);
    }

    // Scale asteroid sphere: diameter 0–800 m maps to radius 1.0–4.0
    const r = Math.max(1.0, Math.min(4.0, d.avgDiam / 80));
    const color = d.isHazardous ? 0xff4444 : 0x00d4ff;
    const emissive = d.isHazardous ? 0x661111 : 0x004466;
    const geo = new THREE.SphereGeometry(r, 14, 14);
    const mat = new THREE.MeshPhongMaterial({
      color,
      emissive,
      emissiveIntensity: 0.6,
      shininess: 60,
    });
    return new THREE.Mesh(geo, mat);
  }

  // --- Init Globe ---
  globeInstance = Globe()(el)
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
    .showAtmosphere(true)
    .atmosphereColor('#0d4a7c')
    .atmosphereAltitude(0.15)
    // 3D sphere objects
    .objectsData(allObjects)
    .objectLat('lat')
    .objectLng('lng')
    .objectAltitude('alt')
    .objectThreeObject(makeSphere)
    .objectLabel(d => d.isMoon
      ? `<div style="background:#0d1117dd;border:1px solid #aaa;padding:8px 12px;border-radius:6px;font-family:monospace;font-size:12px;color:#e0e0e0">
           <div style="color:#cccccc;font-weight:bold;margin-bottom:4px">☽ Moon — Reference Marker</div>
           <div>Distance: 1 LD = 384,400 km</div>
         </div>`
      : `<div style="background:#0d1117dd;border:1px solid ${d.isHazardous ? '#ff4444' : '#00d4ff'};padding:8px 12px;border-radius:6px;font-family:monospace;font-size:12px;color:#e0e0e0;max-width:220px">
           <div style="color:${d.isHazardous ? '#ff4444' : '#00d4ff'};font-weight:bold;margin-bottom:4px">${d.name}</div>
           <div>Date: ${d.date}</div>
           <div>Miss dist: ${d.missLD.toFixed(3)} LD</div>
           <div>Speed: ${d.velocity} km/s</div>
           <div>Diameter: ~${d.diameter} m</div>
           <div style="color:${d.isHazardous ? '#ff4444' : '#00ff88'};margin-top:4px">${d.isHazardous ? '⚠ Potentially Hazardous' : '✓ Safe'}</div>
         </div>`
    );

  // Auto-rotate via OrbitControls (not a chain method in current globe.gl)
  globeInstance.controls().autoRotate = true;
  globeInstance.controls().autoRotateSpeed = 0.35;

  // Stop auto-rotate on interaction
  el.addEventListener('mousedown', () => { globeInstance.controls().autoRotate = false; });
  el.addEventListener('touchstart', () => { globeInstance.controls().autoRotate = false; });

  renderGlobeLegend(allNEOs.length, allNEOs.filter(n => n.isHazardous).length);
}

function renderGlobeLegend(total, hazCount) {
  const legend = document.getElementById('globe-legend');
  if (!legend) return;
  legend.innerHTML = `
    <div class="legend-item">
      <span class="dot" style="background:#00d4ff"></span>
      Safe NEO (${total - hazCount} this week)
    </div>
    <div class="legend-item">
      <span class="dot" style="background:#ff4444"></span>
      Potentially Hazardous (${hazCount})
    </div>
    <div class="legend-item">
      <span class="dot" style="background:#aaaaaa;width:14px;height:14px"></span>
      Moon — 1 LD reference
    </div>
    <div class="legend-item" style="color:#6b7a8d;font-size:11px;margin-top:4px">
      Altitude = log scale of miss distance
    </div>
  `;
}
