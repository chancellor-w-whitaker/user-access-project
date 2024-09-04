import Container from "react-bootstrap/Container";
import ListGroup from "react-bootstrap/ListGroup";
import Stack from "react-bootstrap/Stack";
import Badge from "react-bootstrap/Badge";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useState } from "react";

/*

cases:
add/remove user to group
add/remove report to group
add/remove user to report
add/remove report to user

undo change, <- | ->

*/

const helpers = {
  lists: [
    {
      items: ["chance", "chase", "autumn", "ethan", "zoie", "josh"],
      icon: "person-fill",
      name: "users",
    },
    {
      items: [
        "president's council",
        "institutional research",
        "institutional effectiveness",
        "financial aid",
        "big e central",
        "human resources",
      ],
      icon: "people-fill",
      name: "groups",
    },
    {
      items: [
        "factbook",
        "fast facts",
        "data page",
        "service region map",
        "scholarship dashboard",
        "program review",
      ],
      icon: "clipboard2-fill",
      name: "reports",
    },
  ],
  titleCase: (words) =>
    words
      .split(" ")
      .map(
        (word) =>
          word[0].toLocaleUpperCase() + word.substring(1).toLocaleLowerCase()
      )
      .join(" "),
  joinClassNames: (...classNames) =>
    classNames
      .filter((string) => typeof string === "string" && string.length > 0)
      .join(" "),
  getRandomElement: (array) => array[Math.floor(Math.random() * array.length)],
  defaultIconTextColor: "body-emphasis",
  defaultIconBgColor: "body-secondary",
  isClickedColor: "primary-subtle",
  isDoubleClickedColor: "primary",
  connectingListName: "groups",
};

const {
  defaultIconTextColor,
  isDoubleClickedColor,
  defaultIconBgColor,
  connectingListName,
  getRandomElement,
  joinClassNames,
  isClickedColor,
  titleCase,
  lists,
} = helpers;

const IconSquare = ({
  text = defaultIconTextColor,
  bg = defaultIconBgColor,
  className = "",
  ...props
}) => {
  const inheritedClassName = `icon-square text-${text} bg-${bg} bg-gradient d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3`;

  return (
    <div
      {...props}
      className={joinClassNames(inheritedClassName, className)}
    ></div>
  );
};

const getInitialConnections = (connectingList = connectingListName) =>
  Object.fromEntries(
    lists
      .find(({ name }) => name === connectingList)
      .items.map((group) => [
        group,
        Object.fromEntries(
          lists
            .filter(({ name }) => name !== connectingList)
            .map(({ name }) => [name, new Set()])
        ),
      ])
  );

const initialConnections = getInitialConnections();

const initializeConnection = ({ category, rules }) =>
  Object.entries(rules).forEach(([name, items]) =>
    items.forEach((item) => initialConnections[category][name].add(item))
  );

const connectingList = lists.find(({ name }) => name === connectingListName);

const categories = connectingList.items;

const getItems = (listName) =>
  lists.find(({ name }) => name === listName).items;

for (const category of categories) {
  const userItems = getItems("users");

  const reportItems = getItems("reports");

  const rules = {
    reports: [getRandomElement(reportItems), getRandomElement(reportItems)],
    users: [getRandomElement(userItems), getRandomElement(userItems)],
  };

  initializeConnection({ category, rules });
}

export default function App() {
  const [connections, setConnections] = useState(initialConnections);

  const isGroupConnectedToUser = ({ group, user }) =>
    connections[group].users.has(user);

  const isGroupConnectedToReport = ({ report, group }) =>
    connections[group].reports.has(report);

  console.log(connections);

  const [activeItems, setActiveItems] = useState(
    Object.fromEntries(
      lists.map(({ name }) => [name, { type: null, item: null }])
    )
  );

  const getItemClickHandler =
    ({ name, item }) =>
    ({ type }) =>
      setActiveItems((state) => ({
        ...state,
        [name]: { item, type },
      }));

  const isItemClicked = ({ name, item }) =>
    activeItems[name].item === item && activeItems[name].type === "click";

  const isItemDoubleClicked = ({ name, item }) =>
    activeItems[name].item === item && activeItems[name].type === "dblclick";

  const isItemDisabled = ({ name, item }) =>
    activeItems[name].item !== item && activeItems[name].type === "dblclick";

  const isAnyListItemDoubleClicked = (name) =>
    activeItems[name].type === "dblclick";

  const isAnyListItemClicked = (name) => activeItems[name].type === "click";

  const getIconTextColor = (name) =>
    isAnyListItemDoubleClicked(name) ? "white" : defaultIconTextColor;

  const getIconBgColor = (name) =>
    isAnyListItemDoubleClicked(name)
      ? isDoubleClickedColor
      : defaultIconBgColor;

  const renderIcon = (suffix) => <i className={`bi bi-${suffix}`} />;

  const renderListHeader = ({ icon, name }) => (
    <div className="d-flex align-items-center">
      <IconSquare text={getIconTextColor(name)} bg={getIconBgColor(name)}>
        {renderIcon(icon)}
      </IconSquare>
      <h2 className="mb-0">{titleCase(name)}</h2>
    </div>
  );

  return (
    <>
      <Container>
        <Row>
          {lists.map(({ items, name, icon }, i) => (
            <Col key={i}>
              <Stack gap={3}>
                {renderListHeader({ name, icon })}
                <ListGroup>
                  {items.map((item, j) => (
                    <ListGroup.Item
                      className={joinClassNames(
                        "d-flex gap-2 align-items-center",
                        (isItemDisabled({ name, item }) ||
                          (name === "groups" &&
                            isGroupConnectedToUser({
                              user: activeItems.users.item,
                              group: item,
                            }) &&
                            isGroupConnectedToReport({
                              report: activeItems.reports.item,
                              group: item,
                            }))) &&
                          "text-decoration-line-through"
                      )}
                      variant={isItemClicked({ name, item }) && "primary"}
                      onDoubleClick={getItemClickHandler({ name, item })}
                      onClick={getItemClickHandler({ name, item })}
                      active={isItemDoubleClicked({ name, item })}
                      disabled={isItemDisabled({ name, item })}
                      key={j}
                    >
                      <div className="me-auto">{item}</div>
                      {name === "groups" && [
                        isGroupConnectedToUser({
                          user: activeItems.users.item,
                          group: item,
                        }) && (
                          <Badge bg="secondary" pill>
                            {renderIcon(
                              lists.find(({ name }) => name === "users").icon
                            )}
                          </Badge>
                        ),
                        isGroupConnectedToReport({
                          report: activeItems.reports.item,
                          group: item,
                        }) && (
                          <Badge bg="secondary" pill>
                            {renderIcon(
                              lists.find(({ name }) => name === "reports").icon
                            )}
                          </Badge>
                        ),
                      ]}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Stack>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}
