import { createClient } from '@supabase/supabase-js'
import type { Database } from '../database.types';

// type GatewayType= {(gateway:Database['public']['Tables']['Gateways']['Row'])}
export type DataType = Promise<{
  gateways: {
    ipv4address: string;
    name: string;
    serial_number: string;
  }[];
  devices: {
    date_created: string;
    status: boolean;
    uid: string;
    vendor: string;
  }[];
}>

const supabaseUrl = 'https://hizjgtdaswwzuktgocis.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpempndGRhc3d3enVrdGdvY2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgzOTQxNjgsImV4cCI6MjAyMzk3MDE2OH0.sc-4aHvs7IpmDM-5zbSqDmaa6q7iW2aCSjKCf5pw7Wo'// process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

console.log('supabase', supabase)
let alreadyFetchedData = null;

// Make a request
const getData = async (useAlreadyFetchedDataIfPossible: boolean) => {
  // @ts-ignore
  // const { error1 } = await supabase.from('Gateways').insert({ name: 'GATEWAY022', ipv4address: '1.1.1.1' });
  if (alreadyFetchedData && useAlreadyFetchedDataIfPossible)
    return alreadyFetchedData;

  const { data: gateways, error } = await supabase.from('Gateways').select('*')
  const { data: devices, error: errorD } = await supabase.from('Devices').select('*')

  const gw: Database['public']['Tables']['Gateways']['Row'][] = gateways;
  const dv: Database['public']['Tables']['Devices']['Row'][] = devices;

  const finalData = { gateways: gw, devices: dv }
  console.log('finalData', finalData)

  return finalData;
}

module.exports = getData;

