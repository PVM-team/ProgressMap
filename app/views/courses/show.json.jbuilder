json.course @course, partial:'courses/course', as: :course
json.participants @participants, partial:'users/user', as: :user
json.assignments @assignments, partial: 'assignments/assignment', as: :assignment
json.all_users @all_users, partial:'users/user', as: :user