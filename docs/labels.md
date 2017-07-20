# Labeling issues and pull requests

Here is a summary description of [all the labels](https://github.com/pineapplemachine/higher/labels) available in the [higher repository](https://github.com/pineapplemachine/higher).

Label colors were named using the [Name that Color](http://chir.ag/projects/name-that-color/#7319E7) tool at [chir.ag](http://chir.ag/).


## Effort labels

Effort labels are intended for issues, as a way to communicate how much work is expected to be needed to resolve a given issue. Effort should be thought of as a factor of time to complete and complexity of the problems to be solved. Effort labels should not be used with pull requests.

### effort: low ![color swatch](https://dummyimage.com/16x16/bfd4ff/000.png&text=+)

**Color:** Periwinkle (#bfd4ff)

Issues should be assigned an `effort: low` label when the task is expected to take only a little effort to complete. 

Examples of low-effort tasks might include: Clarifying documentation or writing regression tests. Fixing a bug due to a typo or because of only a few lines of mistaken logic.

### effort: moderate ![color swatch](https://dummyimage.com/16x16/58b0ff/000.png&text=+)

**Color:** Malibu (#58b0ff)

Issues should be assigned an `effort: moderate` label when the task is expected to take a moderate amount of effort to complete. 

Examples of moderate-effort tasks might include: Adding a new feature with a simple use case and few edge cases. Fixing a bug that is particular to a specific feature or features and due to a design issue.

### effort: high ![color swatch](https://dummyimage.com/16x16/7319e7/000.png&text=+)

**Color:** Electric Violet (#7319e7)

Issues should be assigned an `effort: high` label when the task is expected to take a great deal of effort to complete. 

Examples of high-effort tasks might include: Adding a new, complex feature. Fixing a bug arising from a frequently-used and problematic pattern in the codebase.

### effort: very high ![color swatch](https://dummyimage.com/16x16/430997/000.png&text=+)

**Color:** Kingfisher Daisy (#430997)

Issues should be assigned an `effort: very high` label when the task is expected to take an exceptional effort to complete.

Examples of very-high-effort tasks might include: A menial but time-consuming project-wide refactoring. Fixing a bug that is due to a fundemantal design decision by redesigning that aspect and any dependent systems.


## Issue labels

Issue labels explain the nature of an issue. They are not intended for pull requests, and should not be assigned to them.

### issue: question ![color swatch](https://dummyimage.com/16x16/b5ffef/000.png&text=+)

**Color:** Aero Blue (#b5ffef)

Issues should be assigned an `issue: question` label when the issue is a user asking a question about how to use higher.

Examples of question issues might include: A question about the most optimal way to perform some task using higher. An issue posted with the title, "How can I reverse a sequence created with the recur function?"

### issue: duplicate ![color swatch](https://dummyimage.com/16x16/cccccc/000.png&text=+)

**Color:** Silver (#cccccc)

Issues should be assigned an `issue: duplicate` label when there was already an existing issue describing the same need or task.

Examples of duplicate issues might include: An issue posted with the title "Can't map over an empty sequence" when there is already an open issue titled "The map function breaks when the input includes an empty sequence".

### issue: invalid ![color swatch](https://dummyimage.com/16x16/e6e6e6/000.png&text=+)

**Color:** Mercury (#e6e6e6)

Issues should be assigned an `issue: invalid` label when the issue is not meaningful.

Examples of invalid issues might include: An issue posted with the title "asdfadgdafas" and with an empty description.

### issue: wontfix ![color swatch](https://dummyimage.com/16x16/fafafa/000.png&text=+)

**Color:** Alabaster (#fafafa)

Issues should be assigned an `issue: wontfix` label when the issue is valid but can't or won't be addressed.

Examples of wontfix issues might include: An issue requesting a feature that is outside the scope of higher's design goals. An issue asking for a change in behavior that is particular to the poster's use case and that would be problematic for other users.


## Priority labels

Priority labels are intended for issues, not pull requests. Pull requests should not have priority labels.

### priority: high ![color swatch](https://dummyimage.com/16x16/ff0050/000.png&text=+)

**Color:** Torch Red (#ff0050)

Issues should be assigned a `priority: high` label when the issue is very important to resolve.

Examples of high-priority issues might include: Adding a feature to fill a gap in functionality that a great many users must invest effort in working around. Fixing a bug which makes higher unusable for many users.

### priority: low ![color swatch](https://dummyimage.com/16x16/efe8e0/000.png&text=+)

**Color:** Pearl Bush (#efe8e0)

Issues should be assigned a `priority: low` label when the issue is not very important to resolve.

Examples of low-priority issues might include: Adding a feature that benefits only a small number of users. Fixing a bug that is rarely encountered and that does not have severe consequences.

### priority: trivial ![color swatch](https://dummyimage.com/16x16/fff7ee/000.png&text=+)

**Color:** Seashell Peach (#fff7ee)

Issues should be assigned a `priority: low` label when the issue is very unimportant to resolve.

Examples of trivial-priority issues might include: Improving already-adequate documentation to be more clearly worded. Fixing a bug that may theoretically affect users but does not yet affect any, and that does not have substantial consequences if encountered.


## Type labels

Type labels describe what aspects of higher than an issue or pull request pertains to. Issues and pull requests should always have at least one type label.

### type: bug ![color swatch](https://dummyimage.com/16x16/ee0701/000.png&text=+)

**Color:** Red (#ee0701)

Issues should be assigned a `type: bug` label when the issue describes unexpected or undesirable behavior.
Pull requests should be assigned a `type: bug` label when the purpose of the completed task was to fix one or more bugs.

Examples of bug-related tasks might include: Correcting a line of code that produces unwanted exceptions for some inputs. Correcting a function's behavior so that it better matches what behavior is claimed in its documentation.

### type: documentation ![color swatch](https://dummyimage.com/16x16/1d76db/000.png&text=+)

**Color:** Mariner (#1d76db)

Issues should be assigned a `type: documentation` label when the issue is a request for more or better documentation.
Pull requests should be assigned a `type: documentation` label when the completed task adds or improves documentation.

Examples of documentation-related tasks might include: Adding documentation to a previously-undocumented function. Writing a tutorial instructing how to use higher to accomplish a common task.

### type: feature ![color swatch](https://dummyimage.com/16x16/fab704/000.png&text=+)

**Color:** Selective Yellow (#fab704)

Issues should be assigned a `type: feature` label when the issue is a request for new functionality.
Pull requests should be assigned a `type: feature` label when the completed task adds new functionality to higher.

Examples of feature-related tasks might include: Making it possible to reverse a sequence that previously was only unidirectional. Adding a new function for producing a particular kind of sequence.

### type: integration ![color swatch](https://dummyimage.com/16x16/007b75/000.png&text=+)

**Color:** Pine Green (#007b75)

Issues should be assigned a `type: integration` label when the issue is requesting that higher be integrated with another service or dependency.
Pull requests should be assigned a `type: integration` label when the completed task integrates higher with another service or dependency.

Examples of integration-related tasks might include: Creating a new package depending on both higher and another lazy sequences library and registering new functions with higher for converting higher's sequences to and from the library's own lazy sequences.

### type: optimization ![color swatch](https://dummyimage.com/16x16/f9e870/000.png&text=+)

**Color:** Marigold Yellow (#f9e870)

Issues should be assigned a `type: optimization` label when the issue regards making existing functionality more efficient without modifying external behavior.
Pull requests should be assigned a `type: optimization` label when the completed task improves the performance or memory efficiency of some functionality without modifying its behavior or interface.

Examples of optimization-related tasks might include: Reducing the computational complexity of an algorithm used by higher. Adding a method override to a sequence type that produces a more efficient sequence than otherwise.

### type: polish ![color swatch](https://dummyimage.com/16x16/fd8042/000.png&text=+)

**Color:** Crusta (#fd8042)

Issues should be assigned a `type: polish` label when the issue pertains to improving code readability or maintainability, or making improvements to existing functionality.
Pull requests should be assigned a `type: polish` label when the completed task addresses code readability or maintainability problems, or makes improvements to existing functionality.

Examples of polish-related tasks might include: Adding methods to a sequence type in order to expose previously-undocumented functionality. Improving a function's argument validation logic. Making the error object thrown by some unmet condition more descriptive of the problem and the options for fixing it.

### type: security ![color swatch](https://dummyimage.com/16x16/16aa26/000.png&text=+)

**Color:** La Palma (#16aa26)

Issues should be assigned a `type: security` label when the issue regards higher's impact on application security.
Pull requests should be assigned a `type: security` label when the completed task addresses potential security issues within or caused by higher.

Examples of security-related tasks might include: Removing a part of the code that sends user information to a server.

### type: stability ![color swatch](https://dummyimage.com/16x16/bf45f9/000.png&text=+)

**Color:** Heliotrope (#bf45f9)

Issues should be assigned a `type: stability` label when the issue is for improving higher's stability, or increasing confidence in its stability.
Pull requests should be assigned a `type: stability` label when the completed task enhances stability or increases confidence in higher's stability.

Examples of security-related tasks might include: Adding regression tests to a function. Adding a new sequence contract.
