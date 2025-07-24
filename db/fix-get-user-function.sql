-- แก้ไขฟังก์ชัน RPC สำหรับดึงข้อมูลผู้ใช้จาก auth.users
DROP FUNCTION IF EXISTS get_user_by_id;

CREATE OR REPLACE FUNCTION get_user_by_id(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ,
  raw_user_meta_data JSONB
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.phone,
    au.created_at,
    au.raw_user_meta_data
  FROM auth.users au
  WHERE au.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- ให้สิทธิ์การเรียกใช้ฟังก์ชันนี้กับ authenticated users
GRANT EXECUTE ON FUNCTION get_user_by_id TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_id TO anon;
GRANT EXECUTE ON FUNCTION get_user_by_id TO service_role;
