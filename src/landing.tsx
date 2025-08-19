import React from "react";
import {Grid, Segment, Header, Button, Icon, Image} from "semantic-ui-react";
import {Dropzone} from "./dropzone";


export function Landing() {
    return (
        <div className="landing">
            {/* Header */}
            <Segment textAlign="center" className="landing-header">
                <Header as="h1">
                    <Icon name="users" color="blue"/>Family
                </Header>
            </Segment>
            <Grid stackable columns={2}>

                {/* Creator */}
                <Grid.Column>
                    <Segment textAlign="center">
                        <Image id="excel-file" size="tiny" src="/assets/excel-file.png"/>
                        <Header as="h2">Create XLS</Header>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(12, 40px)",
                            gap: "4px",
                            justifyContent: "center",
                            margin: "1.5rem 0"
                        }}>
                            {[...Array(48)].map((_, i) => (
                                <div key={i} style={{
                                    width: "40px",
                                    height: "30px",
                                    border: "1px solid #ccc",
                                    backgroundColor: "#f9f9f9"
                                }}/>
                            ))}
                        </div>
                        <Button fluid primary style={{ margin: "auto" }}>Create XLS</Button>
                    </Segment>
                </Grid.Column>

                {/* Upload GEDCOM */}
                <Grid.Column>
                    <Segment textAlign="center">
                        <Image id="excel-file" size="tiny" src="/assets/gedcom-file.png"/>
                        <Header as="h2">Upload GEDCOM</Header>
                        <Dropzone/>
                    </Segment>
                </Grid.Column>

            </Grid>
        </div>
    );
}
