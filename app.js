; (function () {

    angular.module("groupBuilder", [])

        .component("builder", {
            templateUrl: "builder.html",
            controller: BuilderController,
            controllerAs: "bc"
        })

        .component("pairUp", {
            templateUrl: "pair-up.html",
            controller: PairController,
            controllerAs: "pc",
            bindings: {
                students: "<",
                groupSize: "<"
            }
        })

    function BuilderController() {
        //this controller is all about regularizing the data for the list ... and then saving it
        var bc = this;
        bc.studentArr = [];
        bc.studentArr2 = [];
        bc.killer = "Clear Scouts";
        bc.adder = false;
        bc.lookey = false;
        bc.name = "";
        bc.dropOne = false;
        bc.groupSize = 2;

        // bc.loadStudents();
        bc.studentArr = JSON.parse(localStorage.getItem("scoutGrouper")) || [];

        bc.addStudent = function (newScout) {
            let scout = {
                name: newScout.name,
                troop: newScout.troop,
                color: newScout.color,
                present: true
            }
            bc.scout.name = ""
            bc.studentArr.unshift(scout);
            localStorage.setItem("scoutGrouper", JSON.stringify(bc.studentArr));
        }

        bc.loadStudents = function () {
            bc.studentArr = JSON.parse(localStorage.getItem("scoutGrouper"));
        }

        bc.confirmRemove = function (name) {
            bc.dropOne = true;
            alert(`Click the badge to confirm dropping ${name}.`)
        }

        bc.dropStudent = function (name) {
            for (let i = 0; i < bc.studentArr.length; i++) {
                if (bc.studentArr[i].name == name) {
                    bc.studentArr.splice(i, 1);
                }
                bc.studentArr[i].present = true;
            }
            localStorage.setItem("scoutGrouper", JSON.stringify(bc.studentArr));
            bc.dropOne = false;
        }

        bc.confirmKill = function () {
            bc.killer = "Confirm?";
            alert("This action will kill the current list");
        }

        bc.clearStudents = function (doIt) {
            if (doIt == "yes") {
                bc.studentArr = [];
                localStorage.setItem("scoutGrouper", JSON.stringify(bc.studentArr));
            } else {
                alert("That was close!")
            }
            bc.killer = "Clear Scouts";
        }
    }//end of BuilderController

    function PairController() {
        //this controller is for taking the existing large group 
        //and breaking it into smaller groups of a (relatively) specific size
        var pc = this;
        var absent = 0;
        let tempName = "";
        let numberOfGroups = 0;
        let randNum = -1;
        pc.how = "L";
        pc.underFlowAlert = 0;
        pc.underFlowAlert2 = 0;
        pc.underFlowShow = 0;
        pc.groups = [];

        groupEm();

        function groupEm() {
            absent = countAbsent();
            underFlow(absent);
        }

        function countAbsent() {
            let flag = 0;
            for (let i = 0; i < pc.students.length; i++) {
                if (!pc.students[i].present) {
                    flag++;
                }
            }
            return flag;
        }

        function underFlow(absent) {
            //calculates the desired group size against the current existing group
            pc.underFlowAlert = (pc.students.length - absent) % pc.groupSize;
            pc.underFlowAlert2 = pc.underFlowAlert;
            if (pc.underFlowAlert != 0) {
                pc.underFlowShow = 1;
                //Group size doesn't allow for equal distribution. How shall I proceed?;
            } else {
                pc.underFlowShow = 2;
                //Group size allows for equal distribution.;
            }
        }

        function makeRand() {
            return Math.floor(Math.random() * pc.students.length);
        }

        function grabName() {
            //pulls one name out of the working list and returns it
            let grabbed = "";
            while (!grabbed) {
                randNum = makeRand();
                grabbed = pc.students.splice(randNum, 1);
                if (!grabbed[0].present) {
                    grabbed = "";
                    continue;
                }
            }
            return grabbed[0];
        }

        pc.numOfGrps = function () {
            return Math.floor((pc.students.length - absent) / pc.groupSize)
        }

        pc.assembleGroups = function (how) {
            pc.underFlowShow = 3;
            // function assemblePairs() {
            numberOfGroups = pc.numOfGrps();
            //main guts of the assembleGroups function --v
            switch (how) {
                case "L"://leave alone
                    if (pc.underFlowAlert) {
                        numberOfGroups++;
                    }
                    for (let ng = 0; ng < numberOfGroups; ng++) {
                        pc.groups[ng] = [];
                        for (let gs = 0; gs < pc.groupSize; gs++) {
                            tempName = grabName();
                            pc.groups[ng].push(tempName)
                            if (!pc.students.length) {
                                break;
                            }
                        }
                    }
                    break;
                case "B"://Make bigger
                    for (let ng = 0; ng < numberOfGroups; ng++) {
                        pc.groups[ng] = [];
                        for (let gs = 0; gs < pc.groupSize; gs++) {
                            if (!gs && pc.underFlowAlert) {
                                tempName = grabName();
                                pc.groups[ng].push(tempName);
                                pc.underFlowAlert--;
                            }
                            tempName = grabName();
                            pc.groups[ng].push(tempName);
                        }
                    }
                    break;
                case "S"://Make smaller -- cloning Make bigger because this code keeps generating logic errors
                    numberOfGroups++;
                    pc.groupSize--;//was on line 181.5
                    // if (numberOfGroups == pc.underFlowAlert) {
                    //     pc.underFlowAlert = 0;
                    // } else {
                    //     pc.underFlowAlert = pc.groupSize - pc.underFlowAlert;
                    // }
                    for (let ng = 0; ng < numberOfGroups; ng++) {
                        pc.groups[ng] = [];
                        for (let gs = 0; gs < pc.groupSize; gs++) {
                            if (!gs && pc.underFlowAlert) {
                                // gs++;
                                tempName = grabName();
                                pc.groups[ng].push(tempName);//added this line in refactor
                                pc.underFlowAlert--;//added this line in refactor
                            }
                            tempName = grabName();
                            pc.groups[ng].push(tempName);
                        }
                    }
                    break;
            }//end switch

        }//end of assembleGroups

    }//end of PairController

} ());
const author = "Bert Allen";