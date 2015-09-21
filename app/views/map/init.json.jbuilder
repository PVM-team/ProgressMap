json.course @course, partial:'courses/course', as: :course

json.current_user @current_user, partial:'users/user', as: :user

json.participants @participants, partial:'users/user', as: :user
json.assignments @assignments, partial: 'assignments/assignment', as: :assignment