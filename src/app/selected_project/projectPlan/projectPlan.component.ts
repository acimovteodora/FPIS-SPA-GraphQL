import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ProjectPlanService } from 'src/app/_services/projectPlan.service';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Project } from 'src/app/_model/project';
import { ProjectPlan } from 'src/app/_model/projectPlan';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Student } from 'src/app/_model/student';
import { Phase } from 'src/app/_model/phase';
import { title } from 'process';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { AuthService } from 'src/app/_services/auth.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import client from 'apollo-angular';
import { Subscription } from 'rxjs';
import { InMemoryCache } from '@apollo/client/cache';
import { ApolloClient } from '@apollo/client/core';

const GET_PLAN = gql`
  query planByProject($projectID:Long){
    planQuery{
      planByProject(projectID:$projectID){
        projectID
        documentID
        title
        estimatedStartDate
        dateOfCompilation
        duration
        project{
          projectID
          projectProposal{
            name
          }
        }
        students{
          studentID
          name
          surname
          index
        }
        phases{
          phaseID
          description
          duration
          name
          startDate
          requiredSkills{
            skillID
            name
            description
          }
          engagements{
            studentID
            phaseID
            name
            description
            student{
              name
              index
              studentID
              department
              surname
              yearOfStudy
            }
          }
        }
      }
    }
  }
`;
const PROJECT = gql`
  query projectById($projectID:Long){
    projectQuery{
      projectById(projectID:$projectID){
        projectID
        description
        projectProposal{
          company{
            name
          }
          activities
          name
          proposalDate
          startDateProjectProposal
        }
        applications{
          student{
            name
            surname
            index
          }
          experienceInPreviousProjects
        }
      }
    }
  }
`;
const PROJECT_PLAN = gql`
query planByProject($projectID:Long){
  planQuery{
    planByProject(projectID:$projectID){
      projectID
      projectPlan{
        projectID
        documentID
        dateOfCompilation
        duration
        estimatedStartDate
        title
        phases{
          projectID
          documentID
          phaseID
          description
          duration
          name
          startDate
          requiredSkills{
            projectID
            phaseID
            skillID
            name
            description
          }
          engagements{
            studentID
            phaseID
            projectID
            name
            description
          }
        }
      }
      project{
        projectID
        projectProposal{
          name
          startDateProjectProposal
        }
      }
    	students{
      	studentID
      	name
      	surname
      	index
    	}
      phases{
        phaseID
        description
        duration
        name
        startDate
        requiredSkills{
          skillID
          name
          description
        }
        engagements{
          studentID
          phaseID
          name
          description
        }
      }
    }
  }
}
`;
const ACCEPTED_STUDENTS = gql`
  query acceptedStudents($projectID:Long){
    studentQuery{
      acceptedStudents(projectID:$projectID){
        studentID
        name
        surname
        index
      }
    }
  }
`;
const UPDATE_PLAN = gql`
  mutation editPlan($projectPlan:ProjectPlanInputType){
    projectPlanMutation{
      editProjectPlan(plan:$projectPlan)
    }
  }
`;
const DELETE_PLAN = gql`
  mutation deletePlan($deletePlan:ProjectPlanInputType){
    projectPlanMutation{
      deleteProjectPlan(plan:$deletePlan)
    }
  }
`;
const INSERT_PLAN = gql`
  mutation addPlan($plan:ProjectPlanInputType){
    projectPlanMutation{
      addProjectPlan(plan:$plan)
    }
  }
`;

const omitTypename = (key, value) => (key === '__typename' ? undefined : value);

@Component({
  selector: 'app-projectPlan',
  templateUrl: './projectPlan.component.html',
  styleUrls: ['./projectPlan.component.css']
})
export class ProjectPlanComponent implements OnInit, OnDestroy {
  project: Project;
  projectPlan: any;
  planForEdit: ProjectPlan;
  minDate: Date;
  modalRef: BsModalRef;
  newPhase = false;
  editPhase = false;
  index: number;
  phaseForEdit: Phase;
  bsConfig: Partial<BsDatepickerConfig>;
  name: string;

  //attributes of project plan
  students: Student[];
  phases: Phase[] = [];
  estimatedStartDate: Date;
  duration: number;
  note: string;
  private query: QueryRef<any>;
  private queryProject: Subscription;
  private subs: Subscription;


  constructor(private projectPlanService: ProjectPlanService,
              private route: ActivatedRoute,
              private router: Router,
              public modalService: BsModalService,
              private alertify: AlertifyService,
              private apollo: Apollo) { }

  ngOnDestroy(){
    this.subs.unsubscribe();
    this.queryProject.unsubscribe();
  }
  ngOnInit() {
    // client.reset();
    this.query = this.apollo.watchQuery({
      query: PROJECT,
      pollInterval: 0,
      variables: {projectID: this.route.snapshot.paramMap.get('id')}
    });
    this.queryProject = this.query.valueChanges.subscribe(result => {
      if(result !== undefined && result !== null){
        this.project = JSON.parse(JSON.stringify(result.data.projectQuery.projectById), omitTypename) as Project;
        this.minDate = new Date(this.project.projectProposal.startDateProjectProposal);
        this.name = this.project.projectProposal.name;
        this.bsConfig = {
          containerClass: 'theme-blue'
        }
      }
    }, error => {
      console.log(error);
    });

    this.query = this.apollo.watchQuery({
      query: ACCEPTED_STUDENTS,
      pollInterval: 0,
      variables: {projectID: this.route.snapshot.paramMap.get('id')}
    });
    this.query.valueChanges.subscribe(result => {
      if(result.data.studentQuery.acceptedStudents !== undefined && result.data.studentQuery.acceptedStudents.length !== 0)
        this.students =  JSON.parse(JSON.stringify(result.data.studentQuery.acceptedStudents), omitTypename) as Student[];
    });

    this.query = this.apollo.watchQuery({
      query: PROJECT_PLAN,
      pollInterval: 0,
      fetchPolicy: 'no-cache',
      variables: {projectID: this.route.snapshot.paramMap.get('id')}
    });
    this.subs = this.query.valueChanges.subscribe(result => {
      // this.clearing();
      console.log("Ucitao plan iz backa");
      if(result !== undefined && result !== null){
        if(result.data.planQuery.planByProject !== null) {
          this.projectPlan = JSON.parse(JSON.stringify(result.data.planQuery.planByProject.projectPlan), omitTypename) as ProjectPlan;
          if (this.projectPlan != null) {
            this.planForEdit = this.projectPlan as ProjectPlan;
            this.fill();
          }
        } else{
          this.projectPlan = null;
        }

      }
    }, error => {
      this.projectPlan = null;
    });
  }

  fill() {
    this.note = this.projectPlan.note;
    this.duration = this.projectPlan.duration;
    this.estimatedStartDate = new Date(this.projectPlan.estimatedStartDate);
    this.projectPlan.phases.forEach(phase => {
      this.phases.push(phase);
    });
  }
  clear() {
    this.note = undefined;
    this.duration = undefined;
    this.estimatedStartDate = undefined;
    this.phases = undefined;
  }

  save() {
    if (title !== undefined && this.duration !== undefined && this.estimatedStartDate !== undefined
      && this.phases !== undefined && this.phases !== null) {
      this.projectPlan = {
        title: 'ПЛАН ПРОЈЕКТА: ' + this.project.projectProposal.name,
        dateOfCompilation: new Date(),
        duration: this.duration,
        note: this.note,
        estimatedStartDate: this.estimatedStartDate,
        phases: this.phases,
        projectID: this.project.projectID
      };

      this.apollo.mutate({
        mutation: INSERT_PLAN,
        variables: {
          plan: this.projectPlan
        },
        // refetchQueries: [
        //   {
        //     query: PROJECT_PLAN,
        //     variables: {plan: this.projectPlan}
        //   },
        // ],
      }).subscribe(({ data }) => {
        this.alertify.success('Успешно сте унели план пројекта!');
        this.router.navigate(['/projects/', this.project.projectID]);
      },(error) => {
        console.log('Дошло је до грешке приликом чувања плана пројекта! - ', error);
      });

      // this.projectPlanService.insertProjectPlan(this.authService.decodedToken.nameid, this.projectPlan).subscribe(() => {
      //   this.alertify.success('Успешно је сачуван план пројекта!');
      //   this.router.navigate(['/projects/', this.project.projectID]);
      // }, error => {
      //   this.alertify.error('Дошло је до грешке приликом чувања план пројекта!');
      //   this.projectPlan = null;
      //   console.log(error.message);
      // });
    } else {
      this.alertify.error('Нисте унели све неопходне информације!');
    }
  }

  edit() {
    if (title !== undefined && this.duration !== undefined && this.estimatedStartDate !== undefined
      && this.phases !== undefined && this.phases !== null) {
        if (this.isPlanEdited()) {
          this.planForEdit.estimatedStartDate = this.estimatedStartDate;
          this.planForEdit.note = this.note;
          this.planForEdit.duration = this.duration;
          this.planForEdit.phases = this.phases;

          this.apollo.mutate({
            mutation: UPDATE_PLAN,
            variables: {
              projectPlan: this.planForEdit
            },

            // refetchQueries:[{
            //   query: PROJECT_PLAN,
            //   variables: {projectID: this.route.snapshot.paramMap.get('id')}
            // }],
          }).subscribe(({ data }) => {
            this.alertify.success('Успешно сте изменили план пројекта!');
            this.router.navigate(['/projects/', this.project.projectID]);
          },(error) => {
            console.log(error);
            this.alertify.error('Дошло је до грешке приликом измене плана пројекта!');
          });

          // this.projectPlanService.updateProjectPlan(this.planForEdit).subscribe(() => {
          //   this.alertify.success('Успешно сте изменили план пројекта!');
          //   this.router.navigate(['/projects/', this.project.projectID]);
          // } , error => {
          //   this.alertify.error('Дошло је до грешке приликом измене плана пројекта!');
          // });

        } else {
          this.alertify.error('Нисте направили измену у плану пројекта.');
        }
    } else {
      this.alertify.error('Нисте унели све неопходне информације.');
    }
  }


  delete() {
    this.apollo.mutate({
        mutation: DELETE_PLAN,
        variables: {
          deletePlan: this.planForEdit
        },
        refetchQueries: [
          {
            query: PROJECT_PLAN,
            variables: {projectID: this.route.snapshot.paramMap.get('id')}
          },
        ],
      }).subscribe(({ data }) => {
        this.alertify.success('Успешно сте обрисали план пројекта!');
        this.router.navigate(['/projects/', this.project.projectID]);
        this.clear();
        this.projectPlan = undefined;
      },(error) => {
        this.alertify.error('Дошло је до грешке приликом брисања плана пројекта! + ' + error);
      });

    // this.projectPlanService.delete(this.projectPlan.documentID).subscribe(() => {
    //   this.alertify.success('Успешно је обрисан план пројекта!');
    //   this.router.navigate(['/projects/', this.project.projectID]);
    //   this.clear();
    //   this.projectPlan = undefined;
    // }, error => {
    //   this.alertify.error('Дошло је до грешке приликом брисања плана пројекта!');
    // });
  }

  isPlanEdited() {
    if ( this.duration === this.projectPlan.duration && this.note === this.projectPlan.note &&
      !this.checkDate(this.estimatedStartDate, new Date(this.projectPlan.estimatedStartDate))) {
        return false;
    }
    return true;
  }

  checkDate(date1: Date, date2: Date) {
    if (date1.getDate() === date2.getDate() && date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth()) {
      return false;
    }
    return true;
  }

  addPhase() {
    this.phaseForEdit = null;
    this.newPhase = true;
    this.editPhase = false;
  }

  methodAddPhase(p: Phase) {
    if (p !== undefined) {
      this.phases.push(p);
    }
    this.newPhase = false;
  }

  editSelectedPhase(p: Phase, i: number) {
    this.editPhase = false;
    this.newPhase = false;
    this.phaseForEdit = p;
    this.editPhase = true;
    this.index = i;
  }
  methodEditPhase(p: Phase) {
    if (p !== undefined) {
      this.phases.forEach(phase => {
        if ( this.phases.indexOf(phase) === this.index ) {
          phase = p;
        }
      });
    }
    this.phaseForEdit = null;
    this.editPhase = false;
    this.index = -1;
  }

  deleteSelectedPhase(index: number) {
    this.phases.splice(index, 1);
  }


  back() {
    this.router.navigate(['projects/', this.route.snapshot.paramMap.get('id')]);
  }

  setPlanForEdit(){
    this.planForEdit.documentID = this.projectPlan.documentID;
    this.planForEdit.projectID = this.projectPlan.projectID;
    this.planForEdit.duration = this.projectPlan.duration;
    this.planForEdit.estimatedStartDate = this.projectPlan.estimatedStartDate;
    this.planForEdit.note = this.projectPlan.note;
    this.planForEdit.phases = this.projectPlan.phases;
    this.planForEdit.title = this.projectPlan.title;
    console.log(this.planForEdit);
  }
}
