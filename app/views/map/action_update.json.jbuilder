json.students @students do |student|
	json.id student.id
	json.firstName student.firstName
	json.lastName student.lastName
  	json.email student.email

	json.lastDoneAssignment student.last_done_assignment
end

json.assignments_for_update @assignments_for_update do |assignment_for_update|
	json.id assignment_for_update[:id]
	json.number assignment_for_update[:number]
	json.doers assignment_for_update[:doers]
end