json.course @course, partial:'courses/course', as: :course

json.current_user @current_user, partial:'users/user', as: :user

json.participants @participants, partial:'users/user', as: :user

json.participants @participants do |user|
	json.id user.id
	json.firstName user.firstName
	json.lastName user.lastName

	json.lastDoneAssignment user.latest_done_assignment(@course[0])
end

json.assignments @assignments, partial: 'assignments/assignment', as: :assignment