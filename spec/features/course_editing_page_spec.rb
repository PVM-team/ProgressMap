require 'rails_helper'

describe "Course editing page", js: true do

    before :all do
        self.use_transactional_fixtures = false
    end

    before :each do
        DatabaseCleaner.strategy = :truncation
        DatabaseCleaner.start

        @erkki = FactoryGirl.create :student, firstName: "Erkki", lastName: "Mäkelä"
        FactoryGirl.create :student, firstName: "Mauno", lastName: "Tamminen"
        FactoryGirl.create :student, firstName: "Etunimi", lastName: "Sukunimi"

        @course = FactoryGirl.create :course, name: "Ohtuprojekti"
        @course.students << (FactoryGirl.create :student, firstName: "Mauno", lastName: "Tammi")

        assignment1 = FactoryGirl.create :assignment, number: 1
        assignment1.location = (FactoryGirl.create :location, x: 125, y: 160)
        assignment2 = FactoryGirl.create :assignment, number: 2
        assignment2.location = (FactoryGirl.create :location, x: 425, y: 104)
        assignment3 = FactoryGirl.create :assignment, number: 3
        assignment3.location = (FactoryGirl.create :location, x: 725, y: 201)
        assignment4 = FactoryGirl.create :assignment, number: 4
        assignment4.location = (FactoryGirl.create :location, x: 999, y: 137)

        @course.assignments << assignment1
        @course.assignments << assignment2
        @course.assignments << assignment3
        @course.assignments << assignment4
    end

    after :each do
        DatabaseCleaner.clean
    end

    after :all do
        self.use_transactional_fixtures = true
    end

    describe "when course editing page is visited" do

        before :each do
            visit_course_editing_page
        end

        it "it shows the name of the course to be edited" do
            expect(page).to have_content "Edit course Ohtuprojekti"
        end

        it "there is a canvas" do
            page.find('canvas')
        end

        it "the name of the course is shown in the course name text box" do
            check_input_fields_for_value('Ohtuprojekti')
        end

        it "it shows all the students" do
            expect(find("#students")).to have_content('Mauno Tammi')
            expect(find("#students")).not_to have_content('Erkki Mäkelä')
            expect(find("#students")).not_to have_content('Mauno Tamminen')
            expect(find("#students")).not_to have_content('Etunimi Sukunimi')
        end

        it "it shows all the students not in course" do
            expect(find("#resultview")).not_to have_content('Mauno Tammi Add to course')
            expect(find("#resultview")).to have_content('Erkki Mäkelä')
            expect(find("#resultview")).to have_content('Mauno Tamminen Add to course')
            expect(find("#resultview")).to have_content('Etunimi Sukunimi')
        end

        it 'it shows an assignment in assignmentView' do
            expect(find('#assignmentView')).to have_content('Id: 1, Number: 1')
        end

        it "it shows a button related to the assignment" do
            page.find('button', :text => '1')
        end

        describe "and name of assignment is changed inside assignment name field" do
            before :each do
                fill_in('assignmentName', with: 'uus')
            end

            describe "and change assignment name button is clicked" do
                before :each do
                    click_button 'Change Assignment Name'
                end
                it "the name of the assignment is changed in database" do
                    expect(@course.assignments.count).to be(1)
                    assignment = @course.assignments.first

                    expect(assignment.name).to eq('uus')
                end
            end
        end

        describe "and name of the course is changed inside the course name text box" do

            before :each do
                fill_in('courseName', with: 'Uus kurssi')
            end

            describe "and the Change name button is clicked" do

                before :each do
                    click_button 'Change name'
                end

                it "the name of the course is changed in view" do
                    expect(page).to have_content 'Edit course Uus kurssi'
                end

                it "the name of the course is changed in database" do
                    expect(Course.first.name).to eq('Uus kurssi')
                end
            end
        end

        describe "when first name and last name fields are filled with text" do

            before :each do
                fill_in('firstName', with: 'u')
                fill_in('lastName', with: 'mmi')
            end

            it "it finds the students not in course whose first name and last name have those strings as substrings" do
                expect(find("#resultview")).to have_content('Mauno Tamminen Add to course')
                expect(find("#resultview")).not_to have_content('Erkki Mäkelä')
                expect(find("#resultview")).not_to have_content('Mauno Tammi Add to course')
            end
        end

        describe "when a student is added to course" do

            before :each do
                @students_on_course = @course.students.length

                fill_in('firstName', with: 'Erkki')
                click_button 'Add to course' # Erkki Mäkelä lisätään kurssille
            end

            it "the student will be shown in students list" do
                expect(page.find("#students")).to have_content('Erkki Mäkelä')
            end

            it "the student won't be shown in resultview" do
                expect(page.find("#resultview").text).to be_empty
            end

            it "the student is added to students of the course in database" do
                course = Course.first

                expect(course.students.length).to be(@students_on_course + 1)

                erkki_found = false
                course.students.each do |student|
                    erkki_found = true if student === @erkki
                end
                expect(erkki_found).to be(true)
            end
        end

        describe "when a student is removed from the course" do

            before :each do
                @students_on_course = @course.students.length
                click_button 'Delete student'
            end

            it "deletes the student from studentlist" do
                expect(find("#students")).not_to have_content('Mauno Tammi')
            end

            it "adds the student to all students when deleted" do
                expect(find("#resultview")).to have_content('Mauno Tammi Add to course')
            end

            it "the student is no longer part of the students on the course" do
                course = Course.first
                expect(course.students.length).to be(@students_on_course - 1)
            end
        end


        describe 'when an assignment is added to course' do

            before :each do
                @assignments_initially = @course.assignments.length

                expect(find('#assignmentView')).not_to have_content('Number: 5')
                click_button 'Add a new assignment'
                wait_for_DB_unlocking_after_added_assignment(@assignments_initially)
            end

            it 'a new assignment is added to assignmentView' do
                expect(find('#assignmentView')).to have_content('Number: 5')
            end

            it "the added assignment is shown as a button on the map" do
                page.find('button', :text => '5')
            end

            it "the added assignment is located in correct block" do
                assignment_count = 5
                direction = "left"
                button = find_button(assignment_count.to_s)
                x_loc = x_loc(button)
                y_loc = y_loc(button)
                validate_location(x_loc, y_loc, assignment_count - 1, assignment_count, direction)
            end

            it "a new assignment is added to database" do
                expect(Course.first.assignments.length).to be(@assignments_initially + 1)
                expect(Course.first.assignments.last.number).to be(@assignments_initially + 1)
            end
        end

        describe 'when the assignment #1 is deleted' do

            before :each do
                @assignments_initially = @course.assignments.length
                expect(find('#assignmentView')).to have_content('Id: 1, Number: 1')
                find_button(@assignments_initially)

                click_button('Delete assignment', match: :first)
                wait_for_DB_unlocking_after_delete(@assignments_initially)
            end

            it "assignmentView won't contain the deleted assignment" do
                expect(find('#assignmentView')).not_to have_content('Id: 1, Number: 1')
            end

            it 'there is a button for assignment number #1' do
                find_button('1')
            end

            it 'there is no more button for assignment nro. @assignments_initally' do
                expect(page).not_to have_button(@assignments_initially)
            end

            it 'the last assignment in map is in correct block after delete' do
                assignment_count = @assignments_initially - 1
                direction = "right"
                button = find_button(assignment_count.to_s)
                x_loc = x_loc(button)
                y_loc = y_loc(button)
                validate_location(x_loc, y_loc, assignment_count - 1, assignment_count, direction)
            end

            it "the assignment is removed from database" do
                expect(Course.first.assignments.length).to be(@assignments_initially - 1)
                expect(Course.first.assignments[0].id).to be(2)
            end
        end

        describe "when all assignments are deleted" do

            before :each do
                for i in 0..@course.assignments.length - 1 do
                    click_button('Delete assignment', match: :first)
                    wait_for_DB_unlocking_after_delete(@course.assignments.length - i)
                end
            end

            it "there is no delete button" do
                expect(page).not_to have_button('Delete assignment')
            end

            describe "and when an assignment is added" do

                before :each do
                    click_button('Add a new assignment')
                end

                it "there is a delete button" do
                    find_button('Delete assignment')
                end

                it "its button is placed to the correct block" do
                    button = find_button('1')
                    validate_location(x_loc(button), y_loc(button), 0, 1, "right")
                end
            end
        end

        describe "when 10 new assignments are added" do

            before :each do
                @assignments_initially = @course.assignments.length
                @amount_to_add = 10

                for i in 0..@amount_to_add - 1 do
                    click_button('Add a new assignment')
                    wait_for_DB_unlocking_after_added_assignment(@assignments_initially + i)
                end
                @course = Course.first
                @assignment_count = @assignments_initially + @amount_to_add
            end

            it "10 assignment buttons are placed on canvas" do
                for i in 1..@amount_to_add do
                    find_button(@assignments_initially + i)
                end
            end

            it "10 assignments are added to course" do
                expect(@course.assignments.length).to be(@assignment_count)
            end

            it "the buttons for all assignments are in the blocks they belong to" do
                direction = "left"

                for i in 0..@assignment_count - 1
                    button = find_button((i + 1).to_s)

                    x_loc = x_loc(button)
                    y_loc = y_loc(button)

                    if (i % 4 == 0)
                        if direction === 'left'
                            direction = "right"
                        else
                            direction = "left"
                        end
                    end

                    validate_location(x_loc, y_loc, i, @assignment_count, direction)
                end
            end

            describe "and dependencies between assignments 1 --> 7 and 6 --> 13 are formed and assignment 8 is given name 'Kasi" do

                before :each do
                    assignment = @course.assignments[6]
                    expect(assignment.id).to be(7)
                    expect(assignment.number).to be(7)

                    assignment.dependencies << @course.assignments[0]
                    expect(assignment.dependencies[0].number).to be(1)
                    expect(@course.assignments[6].dependencies.length).to be(1)

                    assignment = @course.assignments[12]
                    expect(assignment.id).to be(13)
                    expect(assignment.number).to be(13)

                    assignment.dependencies << @course.assignments[5]
                    expect(assignment.dependencies[0].number).to be(6)
                    expect(@course.assignments[12].dependencies.length).to be(1)

                    assignment = @course.assignments[7]
                    expect(assignment.number).to be(8)

                    #assignment.name = 'Kasi'
                    #assignment.save
                end

                describe "and 4 first assignments are deleted" do

                    before :each do
                        @amount_deleted = 4

                        for i in 0..@amount_deleted - 1 do
                            click_button('Delete assignment', match: :first)
                            wait_for_DB_unlocking_after_delete(@assignment_count - i)
                        end
                        @course = Course.first
                        @assignment_count = @assignment_count - @amount_deleted
                    end

                    it 'there are @assignment_count - 4 assignment buttons on canvas numbered from 1 to @assignment_count - 4' do
                        for i in 1..@assignment_count
                            find_button(i)
                        end                 

                        expect(page).not_to have_button(@assignment_count + 1)
                    end

                    it '4 assignments are deleted from database' do
                        expect(@course.assignments.length).to be(@assignment_count)
                    end

                    it 'the assignment buttons are located in the blocks they belong to' do
                        direction = "left"

                        for i in 0..@assignment_count - 1
                            button = find_button((i + 1).to_s)

                            x_loc = x_loc(button)
                            y_loc = y_loc(button)

                            if (i % 4 == 0)
                                if direction === 'left'
                                    direction = "right"
                                else
                                    direction = "left"
                                end
                            end

                            validate_location(x_loc, y_loc, i, @assignment_count, direction)
                        end                        
                    end

                    it 'and assignment 1 was a dependency to assignment 7 before, that dependency no more exists' do
                        expect(@course.assignments.first.dependencies.length).to be(0)
                    end

                    it 'and assignment 6 was a dependency to assignment 13 before, that dependency exists between assignments 2 and 9 now' do
                        expect(@course.assignments[8].number).to be(9)
                        expect(@course.assignments[8].dependencies.length).to be(1)
                        expect(@course.assignments[8].dependencies[0].number).to be(2)
                    end

                    it "assignment 4 has name 'Assignment' now" do
                        expect(@course.assignments.fourth.name).to eq('Assignment')
                    end
                end
            end
        end
    end
end

def visit_course_editing_page
    visit '/'
    click_button 'Edit course'
end

def x_loc(button)
    (button[:style].split("left: ")[1]).split("px")[0].to_i + 25
end

def y_loc(button)
    (button[:style].split("top: ")[1]).split("px")[0].to_i + 25
end

def validate_location(x_loc, y_loc, index, assignment_count, direction)
    border_size = 1000 / 40
    block_size = 1000 / 5
    left_border = 50 + 2 * border_size
    top_border = 50 + 2 * border_size

    assignments_per_level = 4
    level_amount = (assignment_count / assignments_per_level) + 1

    if (direction === 'right')
        x_start = left_border + (index % assignments_per_level) * (2 * border_size + block_size)
    else
        x_start = left_border - (index % assignments_per_level) * (2 * border_size + block_size) + (assignments_per_level - 1) * (2 * border_size + block_size)
    end

    y_start = top_border + ((level_amount - (index / assignments_per_level)).ceil - 1) * (2 * border_size + block_size)

    expect(x_loc >= x_start && x_loc < x_start + block_size).to be(true)
    expect(y_loc >= y_start && y_loc < y_start + block_size).to be(true)
end

def wait_for_DB_unlocking_after_added_assignment(assignments_initially)
    find_button(assignments_initially + 1)
end

def wait_for_DB_unlocking_after_delete(assignments_initially)
    expect(page).not_to have_button(assignments_initially)
end
def check_input_fields_for_value(value)
    input_fields = page.all("input")
    amount = input_fields.length

    found = false
    enumerator = input_fields.each

    for i in 1..amount
        elem = enumerator.next
        found = true if elem[:value] === value
    end

    expect(found).to be(true)
end
