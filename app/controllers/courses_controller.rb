class CoursesController < ApplicationController
    include LocationDrawer

    def create_from_outside
        params = JSON.parse(request.body.read.to_s)

        assignments = params["assignments"]
        name = params["course_name"]
        students = params["students"]

        unless name
            render_json(400, "course_name missing!")
            return
        end

        @course = Course.new name: name

        if @course.valid? && validate_assignments(assignments) && validate_students(students)
            @course.save

            assignments = assignments.sort_by { |a| a["number"]}

            add_assignments_to_course_on_random_locations(assignments)
            add_students_to_course(students) if students

            render_json(201, "Course created successfully.", @course.token)

        elsif @course.invalid?
            render_json(400, "Invalid parameter for course_name: " + name + ".\nName must be at least 2 characters long.")

        elsif not validate_assignments(assignments)

            unless assignments.kind_of?(Array)
                render_json(400, "Parameter given as assignments is not an array.\nCourse was not created.")
                return
            end

            unless validate_assignment_count(assignments.length)
                render_json(400, "The number of assignments has to be in range between 1 - 499")
                return
            end

            assignments.each do |assignment|
                a = Assignment.new :name => assignment["name"], :number => assignment["number"]

                if a.invalid?
                    render_json(400, "Array of given assignments is invalid!\nContains invalid assignment: " + a.to_s)
                    break

                elsif not validate_dependencies_of_assignment(assignment["dependencies"], assignments.length)
                    render_json(400, "Array of given assignments is invalid!\nContains invalid dependencies for assignment: (" + a.to_s + ").")
                    break
                end
            end

        elsif not validate_students(students)
            if students.kind_of?(Array)
                
                students.each do |student|
                    s = Student.new :firstName => student["firstName"], :lastName => student["lastName"]

                    if s.invalid?
                        render_json(400, "Array of given students is invalid!\nContains invalid student: " + s.to_s) if s.invalid?
                        break
                    end
                end
            else
                render_json(400, "Parameter given as students is not an array.\nCourse was not created.")
            end
        else
            render_json(600, "Unexpected behavior from valid input.\nCourse was not created.")
        end
    end


    def create
        @course = Course.new(course_params)
        assignments = params[:assignments]
        teacher = Teacher.find_by email: params[:teacherEmail]

        if teacher && @course.valid? && validate_assignment_count(assignments.length)
            @course.save
            assignments.each { |assignment_json| add_assignment_to_course(assignment_json) }
            teacher.courses << @course
        end

        render json: @course
    end

    def edit_name
        @course = Course.find params[:course_id]
        @course.name = params[:name]

        @course.save
        render 'courses/show.json.jbuilder'
    end

    def show
        course = Course.find_by id: params[:course_id]
        @course = []

        if course
            @assignments = course.assignments.order(:number)
            @students = course.students

            @course << course
        end

        render 'courses/show.json.jbuilder'
    end

    private

        def course_params
            params.require(:course).permit(:name)
        end

        def validate_course_name(name)
            name.length >= 2
        end

        def validate_assignment_count(amount)
            amount >= 1 && amount < 500
        end

        def validate_dependency(dependency, assignment_count)
            number = dependency.to_i # palauttaa '0' mikäli string ei vastaa integer -lukua
            
            return false if number <= 0
            number <= assignment_count

        end

        def validate_dependencies_of_assignment(dependencies, assignment_count)
            return true unless dependencies
            return false unless dependencies.kind_of?(Array)

            dependencies.each do |dependency|
                return false unless validate_dependency(dependency, assignment_count)
            end
            true
        end

        def validate_assignments(assignments)
            return false unless assignments.kind_of?(Array)
            return false unless validate_assignment_count(assignments.length)

            assignments.each do |assignment|
                return false if (Assignment.new :name => assignment["name"], :number => assignment["number"]).invalid?
                return false unless validate_dependencies_of_assignment(assignment["dependencies"], assignments.length)
            end
            true
        end

        def validate_students(students)
            return true unless students
            return false unless students.kind_of?(Array)

            students.each do |student|
                s = Student.new firstName: student["firstName"], lastName: student["lastName"]
                return false if s.invalid?
            end
            true
        end

        def add_assignment_to_course(assignment_json)
            location_json = assignment_json[:location]
            dependencies_json_array = assignment_json[:dependencies]

            assignment = Assignment.create name: "tehtävä" + assignment_json[:number].to_s, number: assignment_json[:number]
            assignment.location = (Location.create x: location_json[:x], y: location_json[:y])

            if dependencies_json_array
                dependencies_json_array.each do |dependency_json|
                    dependency = Assignment.find_by id: dependency_json[:id]
                    assignment.dependencies << dependency if dependency
                end
            end

            @course.assignments << assignment
        end

        def add_assignments_to_course_on_random_locations(assignments)
            prev_location = nil

            for i in 0..assignments.length - 1 do
                assignment = Assignment.create :name => assignments[i]["name"], :number => assignments[i]["number"]
                assignment.location = LocationDrawer.next_location(i, prev_location, assignments.length)

                @course.assignments << assignment

                prev_location = assignment.location
            end

            add_dependencies_to_assignments(assignments)
        end

        def add_students_to_course(students)
            students.each do |student|
                @course.students << (Student.create firstName: student["firstName"], lastName: student["lastName"])
            end
        end

        def render_json(code, message, token = nil)
          params = {:code => code, :message => message}
          params[:token] = token if token

          render json: params.to_json
        end

        def add_dependencies_to_assignments(assignments)
            assignments.each do |assignment|

                if assignment["dependencies"]

                    assignment["dependencies"].each do |dependency_number|
                        dependent = @course.assignments[assignment["number"].to_i - 1]
                        dependency = @course.assignments[dependency_number.to_i - 1]

                        dependent.dependencies << dependency
                    end
                end
            end
        end 
end
