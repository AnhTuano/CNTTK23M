-- Create admin user
INSERT INTO users (
  email, 
  password, 
  name, 
  role, 
  major,
  "mustChangePassword",
  locked,
  points,
  "createdAt",
  "updatedAt"
) VALUES (
  'dtc245200672@ictu.edu.vn',
  '$2a$10$jJuHFpOA.EBnZMuByWxV2.Fn1cDzXnx6a3roeOPgFzkKZX.0/IyVm',
  'Admin',
  'Admin',
  'ICTU',
  false,
  false,
  0,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role;

-- Verify the user was created
SELECT id, email, name, role, "createdAt" FROM users WHERE email = 'dtc245200672@ictu.edu.vn';
