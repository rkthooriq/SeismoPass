import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseBandungEarthquakes,
  parseBmkgCoordinates,
  earthquakeMapView,
} from '../src/lib/bmkg.ts';

// Fixture pengujian, tidak dipakai sebagai data cadangan UI.
const event = {
  Tanggal: '10 Nov 2026',
  Jam: '21:31:38 WIB',
  DateTime: '2026-11-10T14:31:38+00:00',
  Magnitude: '4.0',
  Kedalaman: '102 km',
  Lintang: '7.04 LS',
  Bujur: '106.98 BT',
  Coordinates: '-7.04,106.98',
  Wilayah: 'Pusat gempa berada di darat 15 km selatan Kota Sukabumi',
  Dirasakan: 'III Cianjur, II Sukabumi, II - III Ciwidey, II Lembang',
};
const payload = (...events) => ({ Infogempa: { gempa: events } });

test('Bandung includes an outside epicenter only when BMKG reports shaking locally', () => {
  const [result] = parseBandungEarthquakes(payload(event));
  assert.equal(result.region, event.Wilayah);
  assert.equal(result.felt, event.Dirasakan);
  assert.equal(result.dateTime, event.DateTime);
  assert.equal(result.magnitude, event.Magnitude);
  assert.deepEqual(result.coordinates, { latitude: -7.04, longitude: 106.98 });
  assert.deepEqual(result.localFelt, ['II - III Ciwidey', 'II Lembang']);
  assert.equal('fault' in result, false);
  assert.equal('risk' in result, false);
});

test('map coordinates preserve latitude/longitude order and reject invalid or injected values', () => {
  assert.deepEqual(parseBmkgCoordinates(' -7.04, 106.98 '), {
    latitude: -7.04,
    longitude: 106.98,
  });
  assert.deepEqual(parseBmkgCoordinates('0,0'), { latitude: 0, longitude: 0 });
  for (const value of [
    undefined,
    null,
    '',
    '1,2,3',
    '91,107',
    '-7,181',
    'Infinity,1',
    '1,0x7b',
    '-7,106.98evil',
    '-7.04;106.98',
    'https://example.com',
  ]) {
    assert.equal(parseBmkgCoordinates(value), null);
  }
});

test('map marker and full-size link point to the same BMKG epicenter', () => {
  const view = earthquakeMapView({ latitude: -7.04, longitude: 106.98 });
  assert.ok(view);
  assert.deepEqual(view.center, [-7.04, 106.98]);
  const full = new URL(view.full);
  assert.equal(full.origin, 'https://www.openstreetmap.org');
  assert.equal(full.searchParams.get('mlat'), '-7.04');
  assert.equal(full.searchParams.get('mlon'), '106.98');
  const [[south, west], [north, east]] = view.bounds;
  assert.ok(west < 106.98 && east > 106.98);
  assert.ok(south < -7.04 && north > -7.04);
  assert.equal(earthquakeMapView(null), null);
  assert.equal(earthquakeMapView({ latitude: NaN, longitude: 107 }), null);
  assert.equal(earthquakeMapView({ latitude: 89, longitude: 107 }), null);
});

test('a missing or invalid map coordinate keeps the official event without inventing a location', () => {
  for (const Coordinates of [undefined, '', '-107,7', 'javascript:alert(1)']) {
    const [result] = parseBandungEarthquakes(
      payload({ ...event, Coordinates }),
    );
    assert.equal(result.coordinates, null);
    assert.equal(result.region, event.Wilayah);
    assert.equal(result.latitude, event.Lintang);
    assert.deepEqual(result.localFelt, ['II - III Ciwidey', 'II Lembang']);
  }
});

test('unrelated national events and epicenter labels without local felt reports are excluded', () => {
  assert.deepEqual(
    parseBandungEarthquakes(
      payload(
        {
          ...event,
          Wilayah: 'Pusat gempa di Enggano',
          Dirasakan: 'II - III Enggano',
        },
        { ...event, Wilayah: 'Kabupaten Bandung', Dirasakan: 'II Garut' },
      ),
    ),
    [],
  );
});

test('Bandung matches regional place names conservatively and preserves MMI text', () => {
  const [result] = parseBandungEarthquakes(
    payload({
      ...event,
      Dirasakan:
        'II Kab. Bandung Barat, III Cimahi, II Parompong, II Parongpong, II Padalarang, II Ngamprah, II Cisarua, II Bandungan',
    }),
  );
  assert.deepEqual(result.localFelt, [
    'II Kab. Bandung Barat',
    'III Cimahi',
    'II Parompong',
    'II Parongpong',
    'II Padalarang',
    'II Ngamprah',
  ]);
  assert.deepEqual(
    parseBandungEarthquakes(
      payload({
        ...event,
        Dirasakan: 'II Cisarua, II Bandungan, II Lembangfoo',
      }),
    ),
    [],
  );
});

test('Bandung sorts matching reports by event time, independent of upstream order', () => {
  const older = { ...event, DateTime: '2026-11-09T10:00:00+00:00' };
  const newer = { ...event, DateTime: '2026-11-12T10:00:00+00:00' };
  const results = parseBandungEarthquakes(payload(older, newer, event));
  assert.deepEqual(
    results.map((item) => item.dateTime),
    [newer.DateTime, event.DateTime, older.DateTime],
  );
});

test('an empty or unmatched valid feed is distinct from a failed request', () => {
  assert.deepEqual(parseBandungEarthquakes(payload()), []);
  assert.deepEqual(
    parseBandungEarthquakes(payload({ ...event, Dirasakan: '-' })),
    [],
  );
});

test('malformed feed, missing parameters and invalid dates cannot masquerade as no local events', () => {
  for (const value of [
    null,
    {},
    { Infogempa: [] },
    { Infogempa: { gempa: event } },
    payload(null),
    payload({ ...event, Magnitude: 4 }),
    payload({ ...event, Dirasakan: undefined }),
    payload({ ...event, Wilayah: ' ' }),
    payload({ ...event, DateTime: 'invalid' }),
  ]) {
    assert.throws(() => parseBandungEarthquakes(value));
  }
});
