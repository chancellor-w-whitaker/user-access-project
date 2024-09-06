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
  iconColors: {
    bg: { default: "body-secondary", active: "primary" },
    text: { default: "body-emphasis", active: "white" },
  },
  getRandomElement: (array) => array[Math.floor(Math.random() * array.length)],
  listItemClickedVariant: "primary",
  connectingListName: "groups",
  badgeColor: "secondary",
};

const {
  listItemClickedVariant,
  connectingListName,
  getRandomElement,
  joinClassNames,
  iconColors,
  badgeColor,
  titleCase,
  lists,
} = helpers;

const IconSquare = ({
  text = iconColors.text.default,
  bg = iconColors.bg.default,
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

const findListIcon = (listName) =>
  lists.find(({ name }) => name === listName).icon;

// write method for adding item to item
// write method for deleting item from item

// implement logic for maintaining checklist of once checked items
// in other words, to save an action, simply check it
// (and it will appear greyed out, like in the 3rd example on this page:
// https://getbootstrap.com/docs/5.3/examples/list-groups/)
// any action that gets checked as it occurs in the list is considered to be saved,
// and will remain in the list for the remainder of the app session
// checklist item onChange handler (will run setConnections)--
// if ("delete" in actionData && e.target.checked) deleteItemFromCategory()
// if ("delete" in actionData && !e.target.checked) addItemToCategory()
// if ("add" in actionData && e.target.checked) addItemToCategory()
// if ("add" in actionData && !e.target.checked) deleteItemFromCategory()

export default function App() {
  const [connections, setConnections] = useState(initialConnections);

  const [activeItems, setActiveItems] = useState([]);

  const findActiveItem = (name) =>
    activeItems.find((element) => element.name === name) &&
    activeItems.find((element) => element.name === name);

  const getItemClickHandler =
    ({ name, item }) =>
    ({ type }) =>
      setActiveItems((state) => {
        const sameOneClicked = state.find(
          (element) =>
            element.name === name &&
            element.item === item &&
            element.type === "click"
        );

        const filteredState = state.filter((element) => element.name !== name);

        return sameOneClicked && type === "click"
          ? filteredState
          : [...filteredState, { name, item, type }];
      });

  const isItemClicked = ({ name, item }) => {
    const activeItemOfList = findActiveItem(name);

    return (
      activeItemOfList &&
      activeItemOfList.item === item &&
      activeItemOfList.type === "click"
    );
  };

  const isItemDoubleClicked = ({ name, item }) => {
    const activeItemOfList = findActiveItem(name);

    return (
      activeItemOfList &&
      activeItemOfList.item === item &&
      activeItemOfList.type === "dblclick"
    );
  };

  const someGroupDoubleClicked = activeItems.some(
    ({ name, type }) => name === "groups" && type === "dblclick"
  );

  const disableAllUsers = activeItems.some(
    ({ name, type }) => name === "reports" && type === "dblclick"
  );

  const disableAllReports = activeItems.some(
    ({ name, type }) => name === "users" && type === "dblclick"
  );

  const isItemDisabled = ({ name, item }) => {
    const activeItemOfList = findActiveItem(name);

    if (name === "users" && disableAllUsers) {
      return true;
    }

    if (name === "reports" && disableAllReports) {
      return true;
    }

    return (
      activeItemOfList &&
      activeItemOfList.item !== item &&
      activeItemOfList.type === "dblclick"
    );
  };

  const isAnyListItemDoubleClicked = (name) => {
    const activeItemOfList = findActiveItem(name);

    return activeItemOfList && activeItemOfList.type === "dblclick";
  };

  const getIconTextColor = (name) =>
    isAnyListItemDoubleClicked(name)
      ? iconColors.text.active
      : iconColors.text.default;

  const getIconBgColor = (name) =>
    isAnyListItemDoubleClicked(name)
      ? iconColors.bg.active
      : iconColors.bg.default;

  const renderIcon = (suffix) => <i className={`bi bi-${suffix}`} />;

  const renderListHeader = ({ icon, name }) => (
    <div className="d-flex align-items-center">
      <IconSquare text={getIconTextColor(name)} bg={getIconBgColor(name)}>
        {renderIcon(icon)}
      </IconSquare>
      <h2 className="mb-0">{titleCase(name)}</h2>
    </div>
  );

  const activeGroup = findActiveItem("groups")
    ? findActiveItem("groups").item
    : null;

  const activeUser = findActiveItem("users")
    ? findActiveItem("users").item
    : null;

  const activeReport = findActiveItem("reports")
    ? findActiveItem("reports").item
    : null;

  const isGroupConnectedToActiveUser = (group) =>
    connections[group].users.has(activeUser);

  const isGroupConnectedToActiveReport = (group) =>
    connections[group].reports.has(activeReport);

  const isUserConnectedToActiveGroup = (user) =>
    activeGroup in connections && connections[activeGroup].users.has(user);

  const isReportConnectedToActiveGroup = (report) =>
    activeGroup in connections && connections[activeGroup].reports.has(report);

  const isUserConnectedToActiveReport = (user) =>
    Object.entries(connections)
      .filter(([group, { reports }]) => reports.has(activeReport))
      .some(([group, { users }]) => users.has(user));

  const isReportConnectedToActiveUser = (report) =>
    Object.entries(connections)
      .filter(([group, { users }]) => users.has(activeUser))
      .some(([group, { reports }]) => reports.has(report));

  const renderBadge = (listName) => (
    <Badge className="shadow bg-gradient" bg={badgeColor} pill>
      {renderIcon(findListIcon(listName))}
    </Badge>
  );

  const renderBadges = ({ name, item }) => {
    if (name === "groups") {
      return [
        isGroupConnectedToActiveUser(item) && renderBadge("users"),
        isGroupConnectedToActiveReport(item) && renderBadge("reports"),
      ];
    }

    if (name === "users") {
      return [
        isUserConnectedToActiveGroup(item) && renderBadge("groups"),
        isUserConnectedToActiveReport(item) && renderBadge("reports"),
      ];
    }

    if (name === "reports") {
      return [
        isReportConnectedToActiveGroup(item) && renderBadge("groups"),
        isReportConnectedToActiveUser(item) && renderBadge("users"),
      ];
    }
  };

  const actionableUser = someGroupDoubleClicked && disableAllUsers;

  const actionableReport = someGroupDoubleClicked && disableAllReports;

  const getActionData = () => {
    if (!actionableUser && !actionableReport) {
      return false;
    }

    const category = Object.fromEntries(
      Object.entries(
        activeItems.find(({ name }) => name === connectingListName)
      ).filter(([key]) => key === "name" || key === "item")
    );

    const actionable = Object.fromEntries(
      Object.entries(
        activeItems.find(({ name }) => name !== connectingListName)
      ).filter(([key]) => key === "name" || key === "item")
    );

    if (connections[category.item][actionable.name].has(actionable.item)) {
      return { delete: actionable, from: category };
    }

    if (!connections[category.item][actionable.name].has(actionable.item)) {
      return { add: actionable, to: category };
    }
  };

  const actionData = getActionData();

  const actionDescribed = actionData
    ? Object.entries(actionData)
        .map(([key, { item }]) => [key, item])
        .flat()
        .join(" ")
    : null;

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
                      variant={isItemClicked({ name, item }) && "primary"}
                      onDoubleClick={getItemClickHandler({ name, item })}
                      onClick={getItemClickHandler({ name, item })}
                      active={isItemDoubleClicked({ name, item })}
                      className="d-flex gap-2 align-items-center"
                      disabled={isItemDisabled({ name, item })}
                      key={j}
                    >
                      <div className="me-auto">{item}</div>
                      {renderBadges({ item, name })}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Stack>
            </Col>
          ))}
        </Row>
        <Row>
          <Row>
            <Col>Actions</Col>
          </Row>
          <Row>
            <Col>
              <Stack>{actionDescribed}</Stack>
            </Col>
          </Row>
        </Row>
      </Container>
    </>
  );
}
