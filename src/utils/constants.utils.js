export const available_user_roles = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
};

export const user_roles_enum = Object.values(available_user_roles);

export const available_boards = {
  CBSE: "CBSE",
  ICSE: "ICSE",
  ISC: "ISC",
  WB: "WB",
  WBCHSE: "WBCHSE",
  NONE: null,
};
export const boards_enum = Object.values(available_boards);

const available_days = {
  MONDAY: "MONDAY",
  TUESDAY: "TUESDAY",
  WEDNESDAY: "WEDNESDAY",
  THURSDAY: "THURSDAY",
  FRIDAY: "FRIDAY",
  SATURDAY: "SATURDAY",
  SUNDAY: "SUNDAY",
};

export const days_enum = Object.values(available_days);

const learning_modes = {
  BATCH: "BATCH",
  ONLINE: "ONLINE",
  HOME_TUITION: "HOME_TUITION",
};

export const learning_modes_enum = Object.values(learning_modes);

export const available_test_types = {
  CLASS_TEST: "class_test",
  MONTHLY_TEST: "monthly_test",
  FINAL_TEST: "final_exam",
  MOCK_TEST: "mock_test",
};

export const test_types_enum = Object.values(available_test_types);

// ["class_test", "monthly_test", "final_exam", "mock_test"]
