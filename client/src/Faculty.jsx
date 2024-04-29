import {Helmet} from "react-helmet";

function Faculty() {

    return (
        <>
        <Helmet>
            <link href="src/Faculty.css" rel="stylesheet" type="text/css" />
            <script src="public/faculty.js" defer></script>
        </Helmet>
        <div class="container">
            <div class="login-container-wrapper">
                <div class="logo">
                </div>
                <div class="faculty-title"><strong>Faculty Home!</strong></div>
                <div id="student-table">
                        <table>
                            <thead id="student-table-head">
                                <tr>
                                    <th>Name</th>
                                    <th>Page</th>
                                </tr>
                            </thead>
                            <tbody id="student-table-data"></tbody>
                        </table>
                    </div>
            </div>
        </div>
        </>
    )
}

export default Faculty