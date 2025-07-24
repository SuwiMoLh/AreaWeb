-- สร้าง view สำหรับดึงข้อมูลผู้ใช้จาก auth.users
CREATE OR REPLACE VIEW auth_users_view AS
SELECT 
  id,
  email,
  phone,
  created_at,
  raw_user_meta_data
FROM auth.users;

-- ให้สิทธิ์การเข้าถึง view นี้กับ authenticated users
GRANT SELECT ON auth_users_view TO authenticated;
GRANT SELECT ON auth_users_view TO anon;
GRANT SELECT ON auth_users_view TO service_role;
