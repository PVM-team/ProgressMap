json.students @students do |student|
	json.id student.id
	json.firstName student.firstName
	json.lastName student.lastName
  json.email student.email

	json.lastDoneAssignment student.last_done_assignment
end