import { useCallback, useState, useRef } from "react";
import Container from "react-bootstrap/Container";
import ListGroup from "react-bootstrap/ListGroup";
import Stack from "react-bootstrap/Stack";
import Badge from "react-bootstrap/Badge";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

/*

cases:
add/remove user to group
add/remove report to group
add/remove user to report
add/remove report to user

undo change, <- | ->

*/

import { Button } from "react-bootstrap";
import { useEffect } from "react";

const helpers = {
  lists: [
    {
      items: ["chance", "chase", "autumn", "ethan", "zoie", "josh"],
      icon: "person-fill",
      name: "users",
      unit: "user",
      newItem: "",
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
      unit: "group",
      newItem: "",
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
      unit: "report",
      newItem: "",
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
  connectingListName: "groups",
  badgeColor: "secondary",
};

const {
  lists: initialLists,
  connectingListName,
  getRandomElement,
  joinClassNames,
  iconColors,
  badgeColor,
  titleCase,
} = helpers;

const getInitialConnections = (connectingList = connectingListName) =>
  Object.fromEntries(
    initialLists
      .find(({ name }) => name === connectingList)
      .items.map((group) => [
        group,
        Object.fromEntries(
          initialLists
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

const connectingList = initialLists.find(
  ({ name }) => name === connectingListName
);

const categories = connectingList.items;

const getItems = (listName) =>
  initialLists.find(({ name }) => name === listName).items;

for (const category of categories) {
  const userItems = getItems("users");

  const reportItems = getItems("reports");

  const rules = {
    reports: [getRandomElement(reportItems), getRandomElement(reportItems)],
    users: [getRandomElement(userItems), getRandomElement(userItems)],
  };

  initializeConnection({ category, rules });
}

const saved = {
  "financial aid": {
    reports: ["program review", "scholarship dashboard"],
    users: ["autumn", "josh"],
  },
  "institutional effectiveness": {
    reports: ["factbook", "service region map"],
    users: ["ethan"],
  },
  "human resources": {
    reports: ["program review", "fast facts"],
    users: ["zoie", "chase"],
  },
  "big e central": {
    reports: ["fast facts", "program review"],
    users: ["autumn", "josh"],
  },
  "president's council": {
    reports: ["scholarship dashboard"],
    users: ["josh", "zoie"],
  },
  "institutional research": {
    reports: ["scholarship dashboard"],
    users: ["zoie"],
  },
};

const savedSets = Object.fromEntries(
  Object.entries(saved).map(([key, { reports, users }]) => [
    key,
    { reports: new Set(reports), users: new Set(users) },
  ])
);

console.log(savedSets);

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

// for those active when pending exists, if pending method is delete, make active bg danger color

// when you click the checkbox of the action between a user and a report,
// bring up a dialog box where you can uncheck the groups that you do not want to affected
// there will be a confirm button at the bottom of the dialog box
// clicking outside of the dialog box without clicking confirm will end the pending operation (leaving the current menu intact)

// * when dialog box for adding, all unchecked, and must/can only pick one (radio list)
// * pretty print allState below Actions
// * push somewhere to test
// ! add actual data into app
// ! save, cancel all changes

// ! notify user they are removing from many groups
// ! issue when displaying state

export default function App() {
  const [connections, setConnections] = useState(savedSets);

  const [lists, setLists] = useState(initialLists);

  const typeNewListItem = (name) => (e) => {
    const { value } = e.target;

    setLists((state) =>
      state.map((list) =>
        list.name === name
          ? {
              ...list,
              newItem: value,
            }
          : list
      )
    );
  };

  const addListItem = (e) => {
    const { name } = e.target;

    e.preventDefault();

    if (name === "groups") {
      const groupsList = lists.find(({ name: listName }) => listName === name);

      const newGroup = groupsList.newItem.toLocaleLowerCase();

      const allGroups = groupsList.items.map((item) =>
        item.toLocaleLowerCase()
      );

      if (!allGroups.includes(newGroup)) {
        setConnections((state) => ({
          [groupsList.newItem]: { reports: new Set(), users: new Set() },
          ...Object.fromEntries(Object.entries(state)),
        }));
      }
    }

    setLists((state) =>
      state.map((list) =>
        list.name === name
          ? {
              ...list,
              items: list.items
                .map((item) => item.toLocaleLowerCase())
                .includes(list.newItem.toLocaleLowerCase())
                ? list.items
                : [list.newItem, ...list.items],
              newItem: list.items
                .map((item) => item.toLocaleLowerCase())
                .includes(list.newItem.toLocaleLowerCase())
                ? list.newItem
                : "",
            }
          : list
      )
    );
  };

  const findListIcon = (listName) =>
    lists.find(({ name }) => name === listName).icon;

  const popover = usePopover();

  const [activeItems, setActiveItems] = useState([]);

  const [savedActions, setSavedActions] = useState([]);

  const getActionCoordinates = (action) =>
    action.items
      .map((item) => Object.entries(item))
      .flat()
      .join("-");

  // delete a user from a report?
  // delete user from every group containing report
  // create list of actions where user is being deleted from each group
  // perform these actions and save these actions to saved actions
  // (actionHandler should be adjusted to work for array of actions)

  // add a user to a report?
  // add user to one specified group containing report
  // perform this action and save this action to saved actions

  const resetMenu = () => setActiveItems([]);

  // need method to get derived actions when you click the a pending add method between user & report
  // when this takes place, pop up a dialog box where you click which group to go through
  // if clicked, that is the action that takes place & gets added to history
  // if click outside, action gets cancelled

  const getActionHandler =
    (action) =>
    ({ target: { checked } }) => {
      popover.close();

      const { method, items } = action;

      const [itemOne, itemTwo] = items;

      const performingAddMethod =
        (method === "add" && checked) || (method === "delete" && !checked);

      const actionContainsAGroup = items.find(({ name }) => name === "groups");

      const actionIsNew = !("id" in action);

      const isActionNew = (action) => !("id" in action);

      const findAllActions = () => {
        if (actionContainsAGroup) return [action];

        return Object.entries(connections)
          .filter(([group, sets]) => {
            if (sets[itemTwo.name].has(itemTwo.item)) {
              if (performingAddMethod) {
                return !sets[itemOne.name].has(itemOne.item);
              } else {
                return sets[itemOne.name].has(itemOne.item);
              }
            }
          })
          .map(([group]) => ({
            items: [itemOne, { name: "groups", item: group }],
            method,
          }));
      };

      const allActions = findAllActions();

      console.log(allActions);

      const saveActions = (saved) => {
        const newActions = allActions.filter((action) => isActionNew(action));

        const oldActions = allActions.filter((action) => !isActionNew(action));

        const newActionCoordinates = new Set(
          newActions.map((action) => getActionCoordinates(action))
        );

        const oldActionIDs = new Set(oldActions.map(({ id }) => id));

        const toBeAdded = newActions.map((action) => ({
          ...action,
          id: Math.random(),
          checked,
        }));

        const currentModified = saved
          .map((element) =>
            oldActionIDs.has(element.id) ? { ...element, checked } : element
          )
          .filter(
            (element) =>
              !newActionCoordinates.has(getActionCoordinates(element))
          );

        return [...toBeAdded, ...currentModified];
      };

      const handleActions = (state) => {
        const nextState = { ...state };

        allActions.forEach((action) => {
          const [item1, item2] = action.items;

          nextState[item2.item] = { ...nextState[item2.item] };

          const sets = nextState[item2.item];

          sets[item1.name] = new Set(sets[item1.name]);

          performingAddMethod
            ? sets[item1.name].add(item1.item)
            : sets[item1.name].delete(item1.item);
        });

        return nextState;
      };

      // const handleGroupAction = (state) =>
      //   Object.fromEntries(
      //     Object.entries(state).map((entry) => {
      //       let [group, sets] = entry;

      //       const isNotRelevant = group !== itemTwo.item;

      //       if (isNotRelevant) return entry;

      //       sets = { ...sets };

      //       sets[itemOne.name] = new Set(sets[itemOne.name]);

      //       performingAddMethod
      //         ? sets[itemOne.name].add(itemOne.item)
      //         : sets[itemOne.name].delete(itemOne.item);

      //       return [group, sets];
      //     })
      //   );

      // const handleNonGroupAction = (state) =>
      //   // perform add operation
      //   // find every group where
      //   // connections[group][items[1].name].has(items[1].item)
      //   // for every group found, add items[0].item to
      //   // group[items[0].name] (connections[group][items[0].name])
      //   Object.fromEntries(
      //     Object.entries(state).map((entry) => {
      //       let [group, sets] = entry;

      //       const isNotRelevant = !sets[itemTwo.name].has(itemTwo.item);

      //       if (isNotRelevant) return entry;

      //       sets = { ...sets };

      //       sets[itemOne.name] = new Set(sets[itemOne.name]);

      //       performingAddMethod
      //         ? sets[itemOne.name].add(itemOne.item)
      //         : sets[itemOne.name].delete(itemOne.item);

      //       return [group, sets];
      //     })
      //   );

      setConnections(handleActions);

      setSavedActions(saveActions);

      if (actionIsNew) resetMenu();
    };

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

  const isAnyListItemDoubleClicked = (name) => {
    const activeItemOfList = findActiveItem(name);

    return activeItemOfList && activeItemOfList.type === "dblclick";
  };

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

  const getDoubleClickedListItem = (listName) =>
    activeItems.find(
      ({ type, name }) => name === listName && type === "dblclick"
    );

  const renderBadge = (listName) => (
    <Badge className="shadow bg-gradient" bg={badgeColor} key={listName} pill>
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

    const relationship = activeItems.filter(({ type }) => type === "dblclick");

    const category = Object.fromEntries(
      Object.entries(
        relationship.find(({ name }) => name === connectingListName)
      ).filter(([key]) => key === "name" || key === "item")
    );

    const actionable = Object.fromEntries(
      Object.entries(
        relationship.find(({ name }) => name !== connectingListName)
      ).filter(([key]) => key === "name" || key === "item")
    );

    return {
      method: connections[category.item][actionable.name].has(actionable.item)
        ? "delete"
        : "add",
      items: [actionable, category],
      checked: false,
    };
  };

  const pendingActionWithConnectingList = getActionData();

  const getActionBetweenUserAndReport = () => {
    const [dblClickedUser, dblClickedReport] = [
      getDoubleClickedListItem("users"),
      getDoubleClickedListItem("reports"),
    ];

    const isValidExchange = dblClickedUser && dblClickedReport;

    if (!isValidExchange) return false;

    const userIsConnectedToReport = isUserConnectedToActiveReport(activeUser);

    return {
      items: activeItems
        .filter(({ name }) => name === "users" || name === "reports")
        .map(({ name, item }) => ({ name, item })),
      method: userIsConnectedToReport ? "delete" : "add",
      checked: false,
    };
  };

  const pendingActionBetweenDisconnectedLists = getActionBetweenUserAndReport();

  const pendingAction =
    pendingActionWithConnectingList || pendingActionBetweenDisconnectedLists;

  const state = {
    groupsTable: Object.fromEntries(
      Object.entries(connections).map(([group, sets]) => [
        group,
        Object.fromEntries(
          Object.entries(sets).map(([name, set]) => [name, [...set]])
        ),
        // Object.fromEntries(
        //   Object.entries(sets).map(([name, set]) => [name, [...set]])
        // ),
      ])
    ),
    actions: { pending: pendingAction, history: savedActions },
    activeMenuItems: activeItems,
  };

  const prettyState = JSON.stringify(state, undefined, 4);

  const launchDialog =
    pendingActionBetweenDisconnectedLists &&
    pendingActionBetweenDisconnectedLists.method === "add";

  const describeAction = ({ method, items }) =>
    items
      .map((object, index) => [
        index === 0 ? method : method === "delete" ? "from" : "to",
        object,
      ])
      .map(([key, { name: listName, item }]) => [
        key,
        item,
        `(${lists.find(({ name }) => name === listName).unit})`,
      ])
      .flat()
      .join(" ");

  const actions = pendingAction
    ? [
        ...savedActions.filter(
          (action) =>
            getActionCoordinates(action) !== getActionCoordinates(pendingAction)
        ),
      ]
    : savedActions;

  const getIconTextColor = (name) =>
    isAnyListItemDoubleClicked(name)
      ? iconColors.text.active
      : iconColors.text.default;

  const getIconBgColor = (name) =>
    isAnyListItemDoubleClicked(name)
      ? pendingAction && pendingAction.method === "delete"
        ? "danger"
        : "primary"
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

  const isListItemDisabled = ({ name: listName, item: itemName }) => {
    const doubleClickedLists = activeItems.filter(
      ({ type }) => type === "dblclick"
    );

    const listNames = new Set(doubleClickedLists.map(({ name }) => name));

    if (listNames.has(listName)) {
      return (
        doubleClickedLists.find(({ name }) => name === listName).item !==
        itemName
      );
    }

    return !listNames.has(listName) && listNames.size === 2;
  };

  return (
    <>
      <Container>
        <Row className="mb-3">
          {lists.map(({ items, name, icon }, i) => {
            const list = lists.find(({ name: listName }) => listName === name);

            return (
              <Col key={i}>
                <Stack gap={3}>
                  {renderListHeader({ name, icon })}
                  <Form onSubmit={addListItem} name={name}>
                    <Form.Group className="mb-2">
                      <Form.Label>New {list.unit}</Form.Label>
                      <Form.Control
                        value={
                          lists.find(({ name: listName }) => listName === name)
                            .newItem
                        }
                        onChange={typeNewListItem(name)}
                        placeholder={list.unit}
                      />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                      Submit
                    </Button>
                  </Form>
                  <ListGroup>
                    {items.map((item, j) => (
                      <ListGroup.Item
                        className={`d-flex gap-2 align-items-center${
                          isItemDoubleClicked({ name, item }) &&
                          pendingAction.method === "delete"
                            ? " text-bg-danger border-danger"
                            : ""
                        }`}
                        variant={isItemClicked({ name, item }) && "primary"}
                        onDoubleClick={getItemClickHandler({ name, item })}
                        onClick={getItemClickHandler({ name, item })}
                        disabled={isListItemDisabled({ name, item })}
                        active={isItemDoubleClicked({ name, item })}
                        key={j}
                      >
                        <div className="me-auto">{item}</div>
                        {renderBadges({ item, name })}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Stack>
              </Col>
            );
          })}
        </Row>
        <Row>
          <Row>
            <Col>
              <h4>Actions</h4>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form>
                <div className="mb-3">
                  <h5>Pending</h5>
                  {pendingAction ? (
                    launchDialog ? (
                      <div className="position-relative">
                        <Form.Check
                          label={describeAction(pendingAction)}
                          checked={pendingAction.checked}
                          onChange={popover.open}
                          type="checkbox"
                        />
                        {popover.isOpen && (
                          <div
                            className="position-absolute top-100"
                            ref={popover.ref}
                          >
                            <ListGroup>
                              {Object.entries(connections)
                                .filter(([group, sets]) =>
                                  sets[pendingAction.items[1].name].has(
                                    pendingAction.items[1].item
                                  )
                                )
                                .map(([group]) => ({
                                  items: [
                                    pendingAction.items[0],
                                    { name: "groups", item: group },
                                  ],
                                  checked: false,
                                  method: "add",
                                }))
                                .map((action, index) => (
                                  <ListGroup.Item key={index}>
                                    <Form.Check
                                      onChange={getActionHandler(action)}
                                      label={describeAction(action)}
                                      checked={action.checked}
                                      type="checkbox"
                                    />
                                  </ListGroup.Item>
                                ))}
                            </ListGroup>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Form.Check
                        onChange={getActionHandler(pendingAction)}
                        label={describeAction(pendingAction)}
                        checked={pendingAction.checked}
                        type="checkbox"
                      />
                    )
                  ) : (
                    <div style={{ marginBottom: ".125rem" }}>...</div>
                  )}
                  <h5>History</h5>
                  {actions.map((action, index) => (
                    <Form.Check
                      className={
                        action.method === "delete" && "danger-checkbox"
                      }
                      onChange={getActionHandler(action)}
                      label={describeAction(action)}
                      checked={action.checked}
                      type="checkbox"
                      key={index}
                    />
                  ))}
                </div>
              </Form>
            </Col>
          </Row>
        </Row>
        <Row>
          <Col>
            <h2>State</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <pre>{prettyState}</pre>
          </Col>
        </Row>
      </Container>
    </>
  );
}

// Improved version of https://usehooks.com/useOnClickOutside/
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    let startedInside = false;
    let startedWhenMounted = false;

    const listener = (event) => {
      // Do nothing if `mousedown` or `touchstart` started inside ref element
      if (startedInside || !startedWhenMounted) return;
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) return;

      handler(event);
    };

    const validateEventStart = (event) => {
      startedWhenMounted = ref.current;
      startedInside = ref.current && ref.current.contains(event.target);
    };

    document.addEventListener("mousedown", validateEventStart);
    document.addEventListener("touchstart", validateEventStart);
    document.addEventListener("click", listener);

    return () => {
      document.removeEventListener("mousedown", validateEventStart);
      document.removeEventListener("touchstart", validateEventStart);
      document.removeEventListener("click", listener);
    };
  }, [ref, handler]);
};

const usePopover = () => {
  const ref = useRef();

  const [isOpen, toggle] = useState(false);

  const close = useCallback(() => toggle(false), []);

  const open = useCallback(() => toggle(true), []);

  useClickOutside(ref, close);

  return { isOpen, close, open, ref };
};

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
